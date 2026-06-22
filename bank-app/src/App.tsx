import { useState } from 'react'
import { BankProvider } from './store/bankStore';
import type { View } from './types';
import { Layout } from './components/Layout';
import { MainMenu } from './views/MainMenu';
import { Deposit } from './views/Deposit';
import { Withdrawal } from './views/Withdrawal';
import { Transfer } from './views/Transfer';
import { Lokaty } from './views/Lokaty';
import { LoanNew } from './views/LoanNew';
import { LoanRepay } from './views/LoanRepay';
import { History } from './views/History';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const back = () => setView('menu');

  return (
    <BankProvider>
      <Layout>
        {view === 'menu'       && <MainMenu navigate={setView} />}
        {view === 'deposit'    && <Deposit onBack={back} />}
        {view === 'withdrawal' && <Withdrawal onBack={back} />}
        {view === 'transfer'   && <Transfer onBack={back} />}
        {view === 'lokaty'     && <Lokaty onBack={back} />}
        {view === 'loan-new'   && <LoanNew onBack={back} />}
        {view === 'loan-repay' && <LoanRepay onBack={back} />}
        {view === 'history'    && <History onBack={back} />}
      </Layout>
    </BankProvider>
  );
}
