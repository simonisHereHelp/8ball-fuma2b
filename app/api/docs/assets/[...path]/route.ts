import { auth, getAccessToken } from "@/auth";

const driveBaseUrl = "https://www.googleapis.com/drive/v3/files";

type DriveFile = {
  id: string;
  name: string;
};

async function driveFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as T;
}

async function findFolderByName(
  parentId: string,
  name: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    q: `'${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files[0] ?? null;
}

async function findFileByName(
  parentId: string,
  name: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    q: `'${parentId}' in parents and mimeType != 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files[0] ?? null;
}

async function resolveFileId(pathSegments: string[], accessToken: string) {
  const rootId = process.env.DRIVE_FOLDER_ID;

  if (!rootId) {
    throw new Error("DRIVE_FOLDER_ID environment variable is required.");
  }

  if (pathSegments.length === 0) {
    return null;
  }

  const [rootFolderName, ...rest] = pathSegments;
  let folder = await findFolderByName(rootId, rootFolderName, accessToken);
  if (!folder) {
    return null;
  }

  for (const segment of rest.slice(0, -1)) {
    const nextFolder = await findFolderByName(folder.id, segment, accessToken);
    if (!nextFolder) {
      return null;
    }
    folder = nextFolder;
  }

  const fileName = rest.at(-1);
  if (!fileName) {
    return null;
  }

  const file = await findFileByName(folder.id, fileName, accessToken);
  return file?.id ?? null;
}

export async function GET(_req: Request, context: { params: Record<string, string | string[]> }) {
  const { params } = context;
  const session = await auth();
  const accessToken = getAccessToken(session);

  if (!accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rawPath = params.path;
  const pathSegments = (Array.isArray(rawPath) ? rawPath : [rawPath])
    .filter((segment): segment is string => Boolean(segment))
    .map((segment) => decodeURIComponent(segment));

  try {
    const fileId = await resolveFileId(pathSegments, accessToken);
    if (!fileId) {
      return new Response("Not found", { status: 404 });
    }

    const res = await fetch(`${driveBaseUrl}/${fileId}?alt=media`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return new Response(await res.text(), { status: res.status });
    }

    const body = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "application/octet-stream";
    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (error) {
    console.error("[docs-assets] Failed to load asset.", error);
    return new Response("Failed to load asset", { status: 500 });
  }
}
