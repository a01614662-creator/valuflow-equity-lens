// Estructura general de la página: portada o aplicación, más capas flotantes (panel, presentación, avisos).
import { css } from './css';
import type { VM } from './viewmodel';
import { Cover, Drawer, ErrorBanner, Footer, Header, MobileNav, PresentationBar, Splash, Toast } from './pages/shell';
import { ValuePage } from './pages/ValuePage';
import { FlowsPage } from './pages/FlowsPage';
import { RiskPage } from './pages/RiskPage';
import { LabPage } from './pages/LabPage';
import { MultiplesPage } from './pages/MultiplesPage';
import { CombinedPage } from './pages/CombinedPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { AnnexPage } from './pages/AnnexPage';
import { LibraryPage } from './pages/LibraryPage';
import { ImportPage } from './pages/ImportPage';
import { TeamPage } from './pages/TeamPage';

export function Shell({ vm }: { vm: VM }) {
  const { v, ui } = vm;
  return (
    <div style={css('min-height:100vh; background:var(--color-bg); color:var(--color-text); font-family:var(--font-body);')}>
      <Splash vm={vm} />
      <Cover vm={vm} />
      {v.app ? (
        <div>
          <Header vm={vm} />
          <main style={css(`max-width:1360px; margin:0 auto; padding:32px 24px 120px; opacity:${ui.pageO}; transform:${ui.pageT}; transition:opacity .45s ease, transform .55s cubic-bezier(.2,.7,.2,1);`)}>
            <ErrorBanner vm={vm} />
            <ValuePage vm={vm} />
            <FlowsPage vm={vm} />
            <RiskPage vm={vm} />
            <MultiplesPage vm={vm} />
            <TransactionsPage vm={vm} />
            <CombinedPage vm={vm} />
            <LabPage vm={vm} />
            <AnnexPage vm={vm} />
            <LibraryPage vm={vm} />
            <ImportPage vm={vm} />
            <TeamPage vm={vm} />
          </main>
          <Footer vm={vm} />
          <MobileNav vm={vm} />
        </div>
      ) : null}
      <Drawer vm={vm} />
      <PresentationBar vm={vm} />
      <Toast vm={vm} />
    </div>
  );
}
