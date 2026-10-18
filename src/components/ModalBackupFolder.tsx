import { useState } from 'react';
import { Modal } from './Modal';
import { 
  FolderSync, 
  FolderCheck, 
  FolderOpen, 
  HardDrive, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertCircle, 
  Info, 
  ShieldCheck,
  FolderPlus
} from 'lucide-react';

interface ModalBackupFolderProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string | null;
  hasPermission: boolean;
  lastBackupTime: string | null;
  isSupported: boolean;
  isBackingUp: boolean;
  onSelectFolder: () => Promise<void>;
  onReauthorizeFolder: () => Promise<void>;
  onDisconnectFolder: () => Promise<void>;
  onTriggerBackupNow: () => Promise<void>;
}

export function ModalBackupFolder({
  isOpen,
  onClose,
  folderName,
  hasPermission,
  lastBackupTime,
  isSupported,
  isBackingUp,
  onSelectFolder,
  onReauthorizeFolder,
  onDisconnectFolder,
  onTriggerBackupNow,
}: ModalBackupFolderProps) {
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setErrorMessage(null);
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setFeedbackMessage(null);
  };

  const handleBackupClick = async () => {
    try {
      await onTriggerBackupNow();
      showFeedback('Cópia de segurança salva com sucesso na pasta!');
    } catch (err: any) {
      showError(err.message || 'Não foi possível salvar a cópia na pasta selecionada.');
    }
  };

  const handleSelectClick = async () => {
    try {
      await onSelectFolder();
      showFeedback('Pasta vinculada com sucesso! Uma cópia inicial foi salva.');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        showError(err.message || 'Erro ao selecionar pasta.');
      }
    }
  };

  const handleReauthorizeClick = async () => {
    try {
      await onReauthorizeFolder();
      showFeedback('Permissão concedida e sincronização ativada!');
    } catch (err: any) {
      showError(err.message || 'Não foi possível reautorizar a pasta.');
    }
  };

  const handleDisconnectClick = async () => {
    if (confirm('Deseja desvincular a pasta de cópias automáticas? Os arquivos já salvos nela não serão apagados.')) {
      try {
        await onDisconnectFolder();
        showFeedback('Pasta desvinculada com sucesso.');
      } catch (err: any) {
        showError(err.message || 'Erro ao desvincular pasta.');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} title="Cópia Automática na Pasta do Computador" onClose={onClose}>
      <div className="space-y-5">
        {/* Card informativo superior */}
        <div className="rounded-card border border-border-ledger bg-parchment p-4 sm:p-5 flex items-start gap-3.5 transition-colors">
          <div className="p-2.5 rounded-card bg-parchment-elevated border border-border-ledger text-stamp-plum flex-shrink-0">
            <HardDrive size={22} strokeWidth={1.75} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold font-display text-ink tracking-tight">
              Segurança Direta no seu Disco Rígido
            </h3>
            <p className="mt-1 text-xs sm:text-sm font-body text-ink-subtle leading-relaxed">
              Você pode definir uma pasta do seu computador (como <strong>Documentos</strong>, <strong>Área de Trabalho</strong> ou uma pasta sincronizada com <strong>OneDrive/Google Drive</strong>) para guardar cópias automáticas dos seus hóspedes e estadias.
            </p>
            <p className="mt-2 text-xs font-body text-ink-muted flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-stamp-moss flex-shrink-0" />
              <span>Seus dados ficam 100% protegidos contra limpezas de cache ou atualizações do navegador.</span>
            </p>
          </div>
        </div>

        {/* Mensagens de feedback */}
        {feedbackMessage && (
          <div className="rounded-card border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 p-3.5 flex items-center gap-2 text-xs font-body text-emerald-800 dark:text-emerald-300">
            <Check size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-card border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 p-3.5 flex items-center gap-2 text-xs font-body text-rose-800 dark:text-rose-300">
            <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Caso o navegador não suporte a File System API */}
        {!isSupported && (
          <div className="rounded-card border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-start gap-3">
            <Info size={18} className="text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs font-body text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-semibold text-sm">Recurso não disponível neste navegador</p>
              <p className="mt-1">
                A seleção de pastas automáticas em segundo plano é compatível com os navegadores <strong>Google Chrome</strong> e <strong>Microsoft Edge</strong> no computador.
              </p>
              <p className="mt-1.5 text-amber-800 dark:text-amber-300">
                Você pode continuar utilizando normalmente o botão <strong>"Salvar Cópia (Backup)"</strong> na barra superior para baixar os arquivos manualmente.
              </p>
            </div>
          </div>
        )}

        {/* Caso o navegador suporte e NÃO TENHA pasta configurada */}
        {isSupported && !folderName && (
          <div className="rounded-card border border-dashed border-border-ledger bg-parchment/60 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full border border-border-ledger bg-parchment-elevated flex items-center justify-center text-stamp-plum mb-3">
              <FolderPlus size={24} strokeWidth={1.5} />
            </div>
            <h4 className="text-sm font-bold font-display text-ink">
              Nenhuma pasta do computador vinculada ainda
            </h4>
            <p className="mt-1.5 max-w-md mx-auto text-xs sm:text-sm font-body text-ink-subtle">
              Clique abaixo para escolher onde o sistema deve salvar suas cópias de segurança diárias.
            </p>

            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={handleSelectClick}
                className="inline-flex items-center gap-2 rounded-card bg-stamp-plum text-parchment border border-stamp-plum px-4 py-2.5 text-xs sm:text-sm font-body font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <FolderOpen size={16} />
                <span>Escolher Pasta no Computador</span>
              </button>
            </div>

            <p className="mt-4 text-[11px] font-body text-ink-muted">
              💡 Dica: Você pode criar uma pasta chamada <strong>"Backups Dinda de Gatos"</strong> na sua pasta Documentos ou na Área de Trabalho.
            </p>
          </div>
        )}

        {/* Caso o navegador suporte e TENHA pasta configurada */}
        {isSupported && folderName && (
          <div className="rounded-card border border-border-ledger bg-parchment-elevated p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-ledger">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-card border border-border-ledger bg-parchment text-stamp-plum flex-shrink-0">
                  <FolderCheck size={22} className={hasPermission ? 'text-stamp-moss' : 'text-stamp-plum'} />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">Pasta Selecionada</p>
                  <p className="text-base font-bold font-display text-ink truncate" title={folderName}>
                    {folderName}
                  </p>
                </div>
              </div>

              <div>
                {hasPermission ? (
                  <span className="inline-flex items-center gap-1.5 rounded-card px-2.5 py-1 text-xs font-mono font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-stamp-moss inline-block animate-pulse" />
                    <span>Cópia Ativa</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleReauthorizeClick}
                    className="inline-flex items-center gap-1.5 rounded-card px-2.5 py-1 text-xs font-body font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 transition-colors"
                    title="O navegador requer confirmação de acesso a cada nova sessão"
                  >
                    <AlertCircle size={14} className="text-amber-600" />
                    <span>Confirmar Acesso</span>
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-body">
              <div className="rounded-card border border-border-ledger bg-parchment p-3">
                <p className="font-mono text-[10px] font-bold uppercase text-ink-muted">Última cópia na pasta</p>
                <p className="mt-1 font-medium text-ink">
                  {lastBackupTime ? lastBackupTime : 'Nenhuma cópia registrada ainda'}
                </p>
              </div>
              <div className="rounded-card border border-border-ledger bg-parchment p-3">
                <p className="font-mono text-[10px] font-bold uppercase text-ink-muted">Arquivos gerados</p>
                <p className="mt-1 text-ink-subtle truncate" title="dinda-gatos-backup-mais-recente.json">
                  backup-mais-recente.json + cópia do dia
                </p>
              </div>
            </div>

            {!hasPermission && (
              <div className="rounded-card border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs font-body text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
                <span>Por segurança, o navegador solicita sua permissão para gravar na pasta nesta sessão.</span>
                <button
                  type="button"
                  onClick={handleReauthorizeClick}
                  className="flex-shrink-0 px-3 py-1.5 rounded-card bg-amber-600 text-white font-semibold hover:bg-amber-700 transition-colors"
                >
                  Permitir
                </button>
              </div>
            )}

            {/* Ações da pasta */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleBackupClick}
                disabled={isBackingUp}
                className="inline-flex items-center gap-1.5 rounded-card bg-stamp-plum text-parchment border border-stamp-plum px-3.5 py-2 text-xs font-body font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
              >
                <RefreshCw size={14} className={isBackingUp ? 'animate-spin' : ''} />
                <span>{isBackingUp ? 'Salvando...' : 'Fazer Cópia Agora'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectClick}
                  className="inline-flex items-center gap-1.5 rounded-card border border-border-ledger bg-parchment px-3 py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
                >
                  <FolderOpen size={14} />
                  <span>Trocar Pasta</span>
                </button>

                <button
                  type="button"
                  onClick={handleDisconnectClick}
                  className="inline-flex items-center gap-1.5 rounded-card border border-border-ledger bg-parchment px-3 py-2 text-xs font-body font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  title="Remove a vinculação da pasta com o aplicativo"
                >
                  <Trash2 size={14} />
                  <span>Desvincular</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-border-ledger pt-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-card border border-border-ledger bg-parchment px-4 py-2 text-xs font-body font-medium text-ink hover:border-border-ledger-hover transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
}
