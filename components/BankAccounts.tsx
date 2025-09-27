import {
  BanknotesIcon
} from "@heroicons/react/24/solid";

type Account = {
  _id: string;
  balance: number;
  type: string;
  nickname?: string;
}

const BankAccountCard = ({ account }: { account: Account }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-xl flex items-center space-x-4 border border-gray-200">
            <div className="bg-purple-100 p-3 rounded-full">
                <BanknotesIcon/>
            </div>
            <div>
                <p className="font-semibold text-gray-800">{account.nickname}</p>
                <p className="text-sm text-gray-500 capitalize">{account.type}</p>
            </div>
            <div className="ml-auto text-right">
                 <p className="font-bold text-lg text-gray-800">
                    ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
};

// --- Main Component to Display a List of Accounts ---
export const BankAccountsDisplay = ({ accounts }: { accounts: Account[] }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg">
      <h3 className="font-bold text-lg text-gray-800 mb-4">Your Accounts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.slice(0, 2).map(account => ( // Ensure at most 2 accounts are shown
            <BankAccountCard key={account._id} account={account} />
        ))}
      </div>
    </div>
  );
};