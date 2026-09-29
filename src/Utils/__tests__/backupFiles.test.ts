import { keepLocalCopy, pick, saveDocuments } from '@react-native-documents/picker';
import { readFile, unlink, writeFile } from '@dr.pogodin/react-native-fs';
import { BackupFileCancelled, pickBackupFile, saveBackupFile } from '../backupFiles';

const cancelled = Object.assign(new Error('cancelled'), { code: 'OPERATION_CANCELED' });

describe('backupFiles', () => {
  beforeEach(() => jest.clearAllMocks());

  it('writes a temp file, opens the save dialog, then cleans up', async () => {
    (saveDocuments as jest.Mock).mockResolvedValue([{ uri: 'x', name: 'b.json', error: null }]);

    await saveBackupFile('{"a":1}', 'b.json');

    expect(writeFile).toHaveBeenCalledWith('/cache/b.json', '{"a":1}', 'utf8');
    expect(saveDocuments).toHaveBeenCalledWith(
      expect.objectContaining({ sourceUris: ['file:///cache/b.json'], fileName: 'b.json' }),
    );
    expect(unlink).toHaveBeenCalledWith('/cache/b.json');
  });

  it('turns a cancelled dialog into BackupFileCancelled', async () => {
    (saveDocuments as jest.Mock).mockRejectedValue(cancelled);
    await expect(saveBackupFile('{}', 'b.json')).rejects.toBeInstanceOf(BackupFileCancelled);

    (pick as jest.Mock).mockRejectedValue(cancelled);
    await expect(pickBackupFile()).rejects.toBeInstanceOf(BackupFileCancelled);
  });

  it('reads the picked file from a local copy', async () => {
    (pick as jest.Mock).mockResolvedValue([{ uri: 'content://x', name: 'my backup.json' }]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([
      { status: 'success', sourceUri: 'content://x', localUri: 'file:///cache/my%20backup.json' },
    ]);
    (readFile as jest.Mock).mockResolvedValue('{"version":"1"}');

    await expect(pickBackupFile()).resolves.toBe('{"version":"1"}');
    expect(readFile).toHaveBeenCalledWith('/cache/my backup.json', 'utf8');
  });

  it('reports a failed copy', async () => {
    (pick as jest.Mock).mockResolvedValue([{ uri: 'content://x', name: null }]);
    (keepLocalCopy as jest.Mock).mockResolvedValue([{ status: 'error', sourceUri: 'content://x', copyError: 'nope' }]);
    await expect(pickBackupFile()).rejects.toThrow('nope');
  });
});
