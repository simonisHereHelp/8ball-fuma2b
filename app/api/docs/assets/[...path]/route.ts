import { auth, getAccessToken } from "@/auth";

const driveBaseUrl = "https://www.googleapis.com/drive/v3/files";
const folderMimeType = "application/vnd.google-apps.folder";
const orderingPrefixRegex = /^\d\d-(.+)$/;

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
};

function escapeDriveName(name: string) {
  return name.replace(/'/g, "\\'");
}

function decodeSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function normalizeSegment(segment: string) {
  return decodeSegment(segment).normalize("NFC");
}

function stripOrderingPrefix(name: string) {
  const match = orderingPrefixRegex.exec(name);
  return match ? match[1] : name;
}

async function driveFetch<T>(url: string, accessToken: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 300 },
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
    q: `'${parentId}' in parents and mimeType = '${folderMimeType}' and name = '${escapeDriveName(name)}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files[0];
}

async function listFolders(parentId: string, accessToken: string) {
  const params = new URLSearchParams({
    q: `'${parentId}' in parents and mimeType = '${folderMimeType}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1000",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files;
}

async function findFileByName(
  parentId: string,
  name: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    q: `'${parentId}' in parents and name = '${escapeDriveName(name)}' and trashed = false`,
    fields: "files(id,name,mimeType)",
    pageSize: "1",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files[0];
}

async function listFiles(parentId: string, accessToken: string) {
  const params = new URLSearchParams({
    q: `'${parentId}' in parents and mimeType != '${folderMimeType}' and trashed = false`,
    fields: "files(id,name,mimeType)",
    pageSize: "1000",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files;
}

async function resolveDriveFile(
  pathSegments: string[],
  accessToken: string,
  rootId: string,
) {
  let parentId = rootId;

  for (let index = 0; index < pathSegments.length; index += 1) {
    const segment = pathSegments[index];
    const isLast = index === pathSegments.length - 1;

    if (isLast) {
      const file = await findFileByName(parentId, segment, accessToken);
      if (file) {
        return file;
      }

      const files = await listFiles(parentId, accessToken);
      return (
        files.find(
          (item) => normalizeSegment(stripOrderingPrefix(item.name)) === segment,
        ) ?? null
      );
    }

    let folder = await findFolderByName(parentId, segment, accessToken);
    if (!folder) {
      const folders = await listFolders(parentId, accessToken);
      folder =
        folders.find(
          (item) =>
            normalizeSegment(stripOrderingPrefix(item.name)) === segment,
        ) ?? null;
    }

    if (!folder) {
      return null;
    }
    parentId = folder.id;
  }

  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const normalizedPath = path?.map(normalizeSegment);

  if (!normalizedPath?.length) {
    return new Response("Missing asset path.", { status: 400 });
  }

  const session = await auth();
  const accessToken = getAccessToken(session);

  if (!accessToken) {
    return new Response("Unauthorized.", { status: 401 });
  }

  const rootId = process.env.DRIVE_FOLDER_ID;
  if (!rootId) {
    return new Response("Missing DRIVE_FOLDER_ID.", { status: 500 });
  }

  let file: DriveFile | null = null;

  try {
    file = await resolveDriveFile(normalizedPath, accessToken, rootId);
  } catch (error) {
    console.error("[docs-assets] Failed to resolve asset.", error);
    return new Response("Failed to resolve asset.", { status: 500 });
  }

  if (!file) {
    return new Response("Not found.", { status: 404 });
  }

  const downloadUrl = `${driveBaseUrl}/${file.id}?alt=media`;
  const assetResponse = await fetch(downloadUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 3600 },
  });

  if (!assetResponse.ok || !assetResponse.body) {
    return new Response(await assetResponse.text(), {
      status: assetResponse.status,
    });
  }

  const headers = new Headers();
  const contentType = assetResponse.headers.get("content-type");
  const contentLength = assetResponse.headers.get("content-length");

  if (contentType) {
    headers.set("content-type", contentType);
  }
  if (contentLength) {
    headers.set("content-length", contentLength);
  }

  headers.set(
    "cache-control",
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  );

  return new Response(assetResponse.body, {
    status: 200,
    headers,
  });
}
