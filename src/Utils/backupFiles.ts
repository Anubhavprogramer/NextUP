import { Platform } from 'react-native';
import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  saveDocuments,
  types,
} from '@react-native-documents/picker';
import { CachesDirectoryPath, readFile, unlink, writeFile } from '@dr.pogodin/react-native-fs';

/** The user closed the save/pick dialog; callers should just stop quietly. */
export class BackupFileCancelled extends Error {
  constructor() {
    super('Cancelled');
    this.name = 'BackupFileCancelled';
  }
}

const toCancelled = (error: unknown): unknown =>
  isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED
    ? new BackupFileCancelled()
    : error;

// keepLocalCopy returns file:// URIs; the fs module expects plain paths.
const toPath = (uri: string) => decodeURIComponent(uri.replace(/^file:\/\//, ''));

/**
 * Write `contents` to a temp file and let the user choose where to keep it
 * (Files / Downloads / Drive…) with the system save dialog.
 */
export async function saveBackupFile(contents: string, fileName: string): Promise<void> {
  const path = `${CachesDirectoryPath}/${fileName}`;
  await writeFile(path, contents, 'utf8');
  try {
    const [result] = await saveDocuments({
      sourceUris: [`file://${path}`],
      fileName,
      mimeType: 'application/json',
    });
    if (result.error) {
      throw new Error(result.error);
    }
  } catch (error) {
    throw toCancelled(error);
  } finally {
    unlink(path).catch(() => {});
  }
}

/** Let the user pick a backup file and return its text contents. */
export async function pickBackupFile(): Promise<string> {
  let picked;
  try {
    // Android often reports downloaded JSON as octet-stream, so accept any file
    // there and validate the contents instead.
    [picked] = await pick({
      mode: 'import',
      type: Platform.OS === 'ios' ? [types.json] : [types.allFiles],
    });
  } catch (error) {
    throw toCancelled(error);
  }

  const [copy] = await keepLocalCopy({
    destination: 'cachesDirectory',
    files: [{ uri: picked.uri, fileName: picked.name ?? 'nextup-backup.json' }],
  });
  if (copy.status !== 'success') {
    throw new Error(copy.copyError);
  }

  const path = toPath(copy.localUri);
  try {
    return await readFile(path, 'utf8');
  } finally {
    unlink(path).catch(() => {});
  }
}
