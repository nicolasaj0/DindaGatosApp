import { getLocalDateString } from '../utils';

const DB_NAME = 'dinda_gatos_backup_db';
const STORE_NAME = 'backup_config';
const KEY_DIR_HANDLE = 'directory_handle';

const LS_FOLDER_NAME_KEY = 'dinda_backup_folder_name';
const LS_LAST_BACKUP_TIME_KEY = 'dinda_last_auto_backup_timestamp';

/**
 * Checks whether the browser supports the File System Access API (showDirectoryPicker)
 */
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Opens or initializes the IndexedDB database to store the directory handle
 */
function openBackupDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves the selected directory handle into IndexedDB
 */
export async function saveDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openBackupDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, KEY_DIR_HANDLE);
    tx.oncomplete = () => {
      try {
        localStorage.setItem(LS_FOLDER_NAME_KEY, handle.name);
      } catch (e) {
        console.warn('Não foi possível salvar o nome da pasta no localStorage:', e);
      }
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Retrieves the stored directory handle from IndexedDB
 */
export async function getStoredDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openBackupDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(KEY_DIR_HANDLE);
      request.onsuccess = () => resolve((request.result as FileSystemDirectoryHandle) || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Erro ao ler diretório do IndexedDB:', err);
    return null;
  }
}

/**
 * Removes the directory handle from IndexedDB and clears local storage metadata
 */
export async function clearDirectoryHandle(): Promise<void> {
  try {
    const db = await openBackupDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(KEY_DIR_HANDLE);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Erro ao limpar diretório do IndexedDB:', err);
  }

  try {
    localStorage.removeItem(LS_FOLDER_NAME_KEY);
    localStorage.removeItem(LS_LAST_BACKUP_TIME_KEY);
  } catch (e) {
    // ignore
  }
}

/**
 * Gets cached folder name from localStorage for instant display
 */
export function getCachedFolderName(): string | null {
  try {
    return localStorage.getItem(LS_FOLDER_NAME_KEY);
  } catch {
    return null;
  }
}

/**
 * Gets cached last backup timestamp
 */
export function getLastBackupTimestamp(): string | null {
  try {
    return localStorage.getItem(LS_LAST_BACKUP_TIME_KEY);
  } catch {
    return null;
  }
}

/**
 * Sets last backup timestamp
 */
export function setLastBackupTimestamp(timestampStr: string): void {
  try {
    localStorage.setItem(LS_LAST_BACKUP_TIME_KEY, timestampStr);
  } catch {
    // ignore
  }
}

/**
 * Verifies if permission is granted, prompting the user if necessary.
 * Must be called in response to a user gesture if prompt is needed.
 */
export async function verifyFolderPermission(
  handle: FileSystemDirectoryHandle,
  promptUser = false
): Promise<boolean> {
  try {
    const options = { mode: 'readwrite' as const };
    // queryPermission does not require user gesture
    const queryRes = await (handle as any).queryPermission(options);
    if (queryRes === 'granted') {
      return true;
    }
    if (promptUser) {
      // requestPermission requires user gesture
      const requestRes = await (handle as any).requestPermission(options);
      return requestRes === 'granted';
    }
    return false;
  } catch (err) {
    console.warn('Erro ao verificar permissão do diretório:', err);
    return false;
  }
}

/**
 * Prompts user to pick a directory and verifies write permissions
 */
export async function pickBackupDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('Seu navegador não suporta a seleção de pastas locais.');
  }

  const handle = await (window as any).showDirectoryPicker({
    id: 'dinda-gatos-backups',
    mode: 'readwrite',
  });

  await saveDirectoryHandle(handle);
  return handle;
}

/**
 * Writes the backup data into the given directory handle.
 * Creates:
 * 1. `dinda-gatos-backup-[YYYY-MM-DD].json` (Daily snapshot)
 * 2. `dinda-gatos-backup-mais-recente.json` (Always latest copy)
 * 3. `LEIA-ME_COPIAS_DE_SEGURANCA.txt` (Human readable guidance)
 */
export async function writeBackupToFolder(
  handle: FileSystemDirectoryHandle,
  dataToExport: { gatos: any[]; estadias: any[] }
): Promise<{ success: boolean; dateFileName: string }> {
  const jsonContent = JSON.stringify(dataToExport, null, 2);
  const today = getLocalDateString();
  const dateFileName = `dinda-gatos-backup-${today}.json`;
  const latestFileName = 'dinda-gatos-backup-mais-recente.json';

  // 1. Write the daily snapshot file
  const dateFileHandle = await handle.getFileHandle(dateFileName, { create: true });
  const dateWritable = await (dateFileHandle as any).createWritable();
  await dateWritable.write(jsonContent);
  await dateWritable.close();

  // 2. Write the latest file
  const latestFileHandle = await handle.getFileHandle(latestFileName, { create: true });
  const latestWritable = await (latestFileHandle as any).createWritable();
  await latestWritable.write(jsonContent);
  await latestWritable.close();

  // 3. Write/update the README file if not already present
  try {
    const readmeHandle = await handle.getFileHandle('LEIA-ME_COPIAS_DE_SEGURANCA.txt', { create: true });
    const readmeWritable = await (readmeHandle as any).createWritable();
    const readmeText = `=====================================================
DINDA DE GATOS — CÓPIAS DE SEGURANÇA AUTOMÁTICAS
=====================================================

Esta pasta guarda os backups automáticos da sua caderneta de registros
(cadastros de gatinhos, estadias, histórico e controle financeiro).

ARQUIVOS DESTA PASTA:
- "dinda-gatos-backup-mais-recente.json": Sempre contém a cópia mais recente e atualizada.
- "dinda-gatos-backup-AAAA-MM-DD.json": Cópia referente ao dia indicado no nome do arquivo.

COMO RESTAURAR OS DADOS CASO PRECISE:
1. Abra o aplicativo da Dinda de Gatos no navegador.
2. No topo da tela, clique no botão "Restaurar Cópia".
3. Selecione o arquivo "dinda-gatos-backup-mais-recente.json" (ou a data que desejar).
4. Pronto! Todos os seus registros e fotos voltarão para o sistema.
`;
    await readmeWritable.write(readmeText);
    await readmeWritable.close();
  } catch (err) {
    // Non-critical, ignore if fails
  }

  // Update last backup timestamp
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const [year, month, day] = today.split('-');
  const formattedTime = `${day}/${month}/${year} às ${hours}:${minutes}`;
  setLastBackupTimestamp(formattedTime);

  return { success: true, dateFileName };
}

/**
 * Requests native persistent storage from the browser to protect localStorage
 * from automated eviction during disk cleanups.
 */
export async function requestStoragePersistence(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch (err) {
      console.warn('Erro ao solicitar persistência do armazenamento:', err);
      return false;
    }
  }
  return false;
}
