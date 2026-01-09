import type { Source, VirtualFile } from "fumadocs-core/source";
import { compile, type CompiledPage } from "../compile-md";
import { getTitleFromFile } from "../source";
import { meta } from "../meta";
import { auth } from "@/auth";

const folderNames = [
  "HouseUtilities",
  "HousePatio",
  "TaiwanPersonalDocs",
  "TaiwanHouse",
  "BanksAndCards",
];

const driveBaseUrl = "https://www.googleapis.com/drive/v3/files";

type DriveFile = {
  id: string;
  name: string;
  mimeType?: string;
};

function getAccessToken(session: unknown) {
  const token = (session as { AccessToken?: string; accessToken?: string })
    ?.AccessToken ??
    (session as { AccessToken?: string; accessToken?: string })?.accessToken;

  if (!token) {
    return null;
  }

  return token;
}

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

async function listFolderByName(
  rootId: string,
  name: string,
  accessToken: string,
) {
  const params = new URLSearchParams({
    q: `'${rootId}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${name}' and trashed = false`,
    fields: "files(id,name)",
    pageSize: "1",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files[0];
}

async function listFilesInFolder(folderId: string, accessToken: string) {
  const params = new URLSearchParams({
    q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id,name,mimeType)",
    pageSize: "1000",
  });

  const url = `${driveBaseUrl}?${params.toString()}`;
  const data = await driveFetch<{ files: DriveFile[] }>(url, accessToken);
  return data.files;
}

function isSupportedDoc(name: string) {
  const lower = name.toLowerCase();
  return lower.endsWith(".md") || lower.endsWith(".mdx") || lower.endsWith(".txt");
}

async function fetchFileContent(fileId: string, accessToken: string) {
  const url = `${driveBaseUrl}/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.text();
}

export async function createDriveSource(): Promise<
  Source<{
    metaData: { title: string; pages: string[] };
    pageData: {
      title: string;
      load: () => Promise<CompiledPage>;
    };
  }>
> {
  const session = await auth();
  const accessToken = getAccessToken(session);
  const rootId = process.env.DRIVE_FOLDER_ID;

  if (!rootId) {
    throw new Error("DRIVE_FOLDER_ID environment variable is required.");
  }

  if (!accessToken) {
    return {
      files: [...meta],
    };
  }

  const pages: VirtualFile[] = [];
  const folderMeta: VirtualFile[] = [];

  for (const folderName of folderNames) {
    const folder = await listFolderByName(rootId, folderName, accessToken);
    if (!folder) {
      throw new Error(`Drive folder not found: ${folderName}`);
    }

    folderMeta.push({
      type: "meta",
      path: `${folderName}/meta.json`,
      data: {
        title: folderName,
        root: true,
        pages: ["index", "..."],
      },
    });

    const files = await listFilesInFolder(folder.id, accessToken);

    for (const file of files) {
      if (!isSupportedDoc(file.name)) {
        continue;
      }

      const virtualPath = `${folderName}/${file.name}`;

      pages.push({
        type: "page",
        path: virtualPath,
        data: {
          title: getTitleFromFile(virtualPath),
          async load() {
            const content = await fetchFileContent(file.id, accessToken);
            return compile(virtualPath, content);
          },
        },
      } satisfies VirtualFile);
    }
  }

  return {
    files: [...pages, ...folderMeta, ...meta],
  };
}
