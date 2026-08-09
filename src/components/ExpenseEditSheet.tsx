import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { fmtCurrency } from '../lib/format';
import { CategorySelect } from './CategorySelect';

interface Props {
  id: string;
  onClose: () => void;
}

export function ExpenseEditSheet({ id, onClose }: Props) {
  const { expenses, categories, settings, updateExpense, deleteExpenseWithUndo } = useApp();
  const exp = expenses.find((x) => x.id === id);

  const [amount, setAmount] = useState(String(exp?.amount ?? ''));
  const [note, setNote] = useState(exp?.note ?? '');
  const [categoryId, setCategoryId] = useState(exp?.categoryId ?? '');
  const [date, setDate] = useState(exp?.date ?? '');
  const [reimbursable, setReimbursable] = useState(exp?.type === 'reimbursable');
  const [refundedInput, setRefundedInput] = useState(
    exp?.amountRefunded ? String(exp.amountRefunded) : '',
  );
  const [amountError, setAmountError] = useState('');
  const [noteError, setNoteError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!exp) return null;

  const amt = parseFloat(amount) || 0;
  const refundedNum = parseFloat(refundedInput) || 0;
  const net = amt - (reimbursable ? refundedNum : 0);

  const save = async () => {
    const amtParsed = parseFloat(amount);
    let aErr = '';
    let nErr = '';
    if (isNaN(amtParsed) || amtParsed <= 0) aErr = 'Enter a valid amount';
    if (!note.trim()) nErr = 'Add a note to continue';
    if (aErr || nErr) {
      setAmountError(aErr);
      setNoteError(nErr);
      return;
    }
    await updateExpense(id, {
      amount: amtParsed,
      note: note.trim(),
      categoryId,
      date,
      type: reimbursable ? 'reimbursable' : 'simple',
      amountRefunded: reimbursable ? Math.min(Math.max(refundedNum, 0), amtParsed) : 0,
    });
    onClose();
  };

  const confirmDeleteExpense = async () => {
    await deleteExpenseWithUndo(id);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/45 flex items-end justify-center z-50">
      <div className="w-full max-w-[480px] bg-[var(--c-bg)] rounded-t-[20px] px-6 pt-3 pb-8 box-border flex flex-col max-h-[88dvh] overflow-y-auto overflow-x-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[18px] font-medium">Edit expense</div>
          <button onClick={onClose} className="flex items-center justify-center p-1.5 bg-transparent border-none text-[var(--c-sub)] cursor-pointer">
            <XMarkIcon className="w-[18px] h-[18px]" strokeWidth={1.6} />
          </button>
        </div>

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Amount</div>
        <div className="flex items-baseline gap-1.5 border-b border-[var(--c-surface)] pb-2.5">
          <span className="text-[28px] text-[var(--c-sub)]">{fmtCurrency(0, settings.currency).replace(/[\d.]/g, '')}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountError('');
            }}
            className="text-[40px] font-medium bg-transparent border-none outline-none w-full p-0"
          />
        </div>
        {amountError && <div className="text-[12px] text-[var(--c-sub)] mt-2">{amountError}</div>}

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Note</div>
        <input
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setNoteError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
          className="w-full p-3 px-3.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[15px] outline-none box-border"
        />
        {noteError && <div className="text-[12px] text-[var(--c-sub)] mt-2">{noteError}</div>}

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Category</div>
        <CategorySelect categories={categories} value={categoryId} onChange={setCategoryId} />

        <div className="text-[13px] text-[var(--c-sub)] my-3.5">Date</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 px-3.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[15px] outline-none box-border"
          style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}
        />

        <div className="flex items-center justify-between mt-1.5">
          <div className="text-[13px] text-[var(--c-sub)] my-3.5">Reimbursable</div>
          <button
            onClick={() => {
              setReimbursable((r) => !r);
              setRefundedInput('');
            }}
            className="w-11 h-[26px] rounded-full border-none p-[3px] flex cursor-pointer"
            style={{ background: reimbursable ? 'var(--c-accent)' : 'var(--c-surface)', justifyContent: reimbursable ? 'flex-end' : 'flex-start' }}
          >
            <div className="w-5 h-5 rounded-full" style={{ background: reimbursable ? '#fff' : 'var(--c-sub)' }} />
          </button>
        </div>
        {reimbursable && (
          <div className="mt-1">
            <div className="text-[13px] text-[var(--c-sub)] mb-2">Amount reimbursed</div>
            <div className="flex items-baseline gap-1.5 border-b border-[var(--c-surface)] pb-2.5">
              <span className="text-[28px] text-[var(--c-sub)]">{fmtCurrency(0, settings.currency).replace(/[\d.]/g, '')}</span>
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={amt}
                step="0.01"
                placeholder="0"
                value={refundedInput}
                onChange={(e) => setRefundedInput(e.target.value)}
                onBlur={() => {
                  if (refundedInput.trim() === '') return;
                  const v = parseFloat(refundedInput);
                  if (isNaN(v)) {
                    setRefundedInput('');
                    return;
                  }
                  setRefundedInput(String(Math.max(0, Math.min(v, amt))));
                }}
                className="text-[28px] font-medium bg-transparent border-none outline-none w-full p-0"
              />
            </div>
            <div className="text-[13px] text-[var(--c-sub)] mt-2 mb-4">Net: {fmtCurrency(net, settings.currency)}</div>
          </div>
        )}

        <div className="h-2" />
        <button
          onClick={save}
          className="w-full p-4 rounded-xl text-[16px] font-medium border-none cursor-pointer"
          style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}
        >
          Save changes
        </button>
        <button
          onClick={() => setConfirmDelete(true)}
          className="bg-transparent border-none text-[var(--c-warn)] text-[14px] pt-3.5 cursor-pointer text-center"
        >
          Delete expense
        </button>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-[60] p-6" onClick={() => setConfirmDelete(false)}>
          <div
            className="w-full max-w-[340px] bg-[var(--c-surface)] rounded-2xl p-[22px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[17px] font-medium mb-2">Delete expense?</div>
            <div className="text-[14px] text-[var(--c-sub)] leading-relaxed mb-5">
              This expense will be removed from your records.
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 p-3 rounded-[10px] bg-transparent border border-[var(--c-bg)] text-[15px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteExpense}
                className="flex-1 p-3 rounded-[10px] border-none text-[15px] text-white cursor-pointer"
                style={{ background: 'var(--c-warn)' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
