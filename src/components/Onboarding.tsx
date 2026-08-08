import { useState } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useApp } from '../store/AppContext';
import { CURRENCY_SYMBOLS, MISC_CATEGORY_ID } from '../constants';
import { ordinal, WEEKDAY_ABBR, WEEKDAY_NAMES } from '../lib/dates';
import type { BudgetCycle, Category, Settings } from '../types';

interface DraftCategory {
  id: string;
  name: string;
  color: string;
}

const CATEGORY_COLORS_CYCLE = ['#7B93A6', '#B97A5D', '#C4A052', '#9B7A94', '#6C9B8F', '#A69481'];

function blurOnEnter(e: React.KeyboardEvent<HTMLInputElement>) {
  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
}

export function Onboarding() {
  const { finishOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const [currency, setCurrency] = useState<'SGD' | 'PHP'>('SGD');
  const [budgetInput, setBudgetInput] = useState('');
  const [cycleType, setCycleType] = useState<'monthly' | 'semi-monthly' | 'weekly'>('monthly');
  const [cycleStartDay, setCycleStartDay] = useState(1);
  const [cycleDay1, setCycleDay1] = useState(5);
  const [cycleDay2, setCycleDay2] = useState(20);
  const [cycleStartDayOfWeek, setCycleStartDayOfWeek] = useState(0);
  const [categories, setCategories] = useState<DraftCategory[]>([]);
  const [newCatName, setNewCatName] = useState('');

  const budgetValid = parseFloat(budgetInput) > 0;

  const addCategory = () => {
    const name = newCatName.trim();
    if (!name) return;
    setCategories((cats) => [
      ...cats,
      { id: 'c' + Date.now(), name, color: CATEGORY_COLORS_CYCLE[cats.length % CATEGORY_COLORS_CYCLE.length] },
    ]);
    setNewCatName('');
  };

  const removeCategory = (id: string) => {
    setCategories((cats) => cats.filter((c) => c.id !== id));
  };

  const finish = async () => {
    const budget = parseFloat(budgetInput) || 0;
    const budgetCycle: BudgetCycle =
      cycleType === 'monthly'
        ? { type: 'monthly', startDay: cycleStartDay }
        : cycleType === 'semi-monthly'
          ? { type: 'semi-monthly', days: [cycleDay1, cycleDay2] }
          : { type: 'weekly', startDayOfWeek: cycleStartDayOfWeek };
    const settings: Settings = {
      currency,
      monthlyBudget: budget,
      theme: 'dark',
      budgetCycle,
    };
    const now = new Date().toISOString();
    const cats: Category[] = [
      ...categories.map((c) => ({ id: c.id, name: c.name, color: c.color, createdAt: now })),
      { id: MISC_CATEGORY_ID, name: 'Miscellaneous', color: CATEGORY_COLORS_CYCLE[categories.length % CATEGORY_COLORS_CYCLE.length], createdAt: now },
    ];
    await finishOnboarding(settings, cats);
  };

  const nextColor = CATEGORY_COLORS_CYCLE[categories.length % CATEGORY_COLORS_CYCLE.length];

  return (
    <div
      className="max-w-[480px] mx-auto min-h-dvh relative flex flex-col bg-[var(--c-bg)] text-[var(--c-text)]"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="px-6 pt-7">
        <div className="h-1 w-full bg-[var(--c-surface)] rounded overflow-hidden">
          <div
            className="h-full bg-[var(--c-accent)] transition-all duration-300"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="flex flex-col min-h-[calc(100dvh-40px)] px-6 py-8 box-border">
          <div className="text-[13px] text-[var(--c-sub)] tracking-wide mb-3">Step 1 of 3</div>
          <div className="text-[26px] font-medium mb-7 leading-tight">What's your monthly budget?</div>
          <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Currency</div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'SGD' | 'PHP')}
            className="w-full p-3 rounded-[10px] bg-[var(--c-surface)] text-[var(--c-text)] border-none text-[15px] outline-none"
          >
            <option value="SGD">SGD</option>
            <option value="PHP">PHP</option>
          </select>
          <div className="h-5" />
          <div className="flex items-baseline gap-1.5 border-b border-[var(--c-surface)] pb-2.5">
            <span className="text-[28px] text-[var(--c-sub)]">{CURRENCY_SYMBOLS[currency]}</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="2000"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              onKeyDown={blurOnEnter}
              className="text-[40px] font-medium bg-transparent border-none outline-none w-full p-0"
            />
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setStep(1)}
            disabled={!budgetValid}
            className="w-full p-4 rounded-xl text-[16px] font-medium border-none disabled:cursor-not-allowed"
            style={{
              background: budgetValid ? 'var(--c-accent)' : 'var(--c-surface)',
              color: budgetValid ? 'var(--c-on-accent)' : 'var(--c-sub)',
              cursor: budgetValid ? 'pointer' : 'not-allowed',
            }}
          >
            Continue
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col min-h-[calc(100dvh-40px)] px-6 py-8 box-border">
          <div className="text-[13px] text-[var(--c-sub)] tracking-wide mb-3">Step 2 of 3</div>
          <div className="text-[26px] font-medium mb-7 leading-tight">How does your budget cycle work?</div>
          <div className="flex flex-col gap-2.5 mt-2">
            <button
              onClick={() => setCycleType('monthly')}
              className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
              style={{ border: cycleType === 'monthly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
            >
              <div className="text-[16px] font-medium">Every month</div>
              <div className="text-[13px] text-[var(--c-sub)] mt-0.5">Starts on the {ordinal(cycleStartDay)}</div>
            </button>
            <button
              onClick={() => setCycleType('semi-monthly')}
              className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
              style={{ border: cycleType === 'semi-monthly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
            >
              <div className="text-[16px] font-medium">Twice a month</div>
              <div className="text-[13px] text-[var(--c-sub)] mt-0.5">
                {ordinal(Math.min(cycleDay1, cycleDay2))} and {ordinal(Math.max(cycleDay1, cycleDay2))}
              </div>
            </button>
            <button
              onClick={() => setCycleType('weekly')}
              className="text-left p-4 rounded-xl bg-[var(--c-surface)] cursor-pointer"
              style={{ border: cycleType === 'weekly' ? '1px solid var(--c-accent)' : '1px solid transparent' }}
            >
              <div className="text-[16px] font-medium">Every week</div>
              <div className="text-[13px] text-[var(--c-sub)] mt-0.5">
                Starts {WEEKDAY_NAMES[cycleStartDayOfWeek]}s
              </div>
            </button>
          </div>

          {cycleType === 'monthly' && (
            <div className="mt-5">
              <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Start day</div>
              <input
                type="number"
                min={1}
                max={31}
                value={cycleStartDay}
                onChange={(e) => setCycleStartDay(Number(e.target.value) || 1)}
                className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none"
              />
            </div>
          )}
          {cycleType === 'semi-monthly' && (
            <div className="mt-5 flex gap-4">
              <div>
                <div className="text-[13px] text-[var(--c-sub)] mb-1.5">First day</div>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={cycleDay1}
                  onChange={(e) => setCycleDay1(Number(e.target.value) || 1)}
                  className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none"
                />
              </div>
              <div>
                <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Second day</div>
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={cycleDay2}
                  onChange={(e) => setCycleDay2(Number(e.target.value) || 1)}
                  className="w-20 p-2.5 rounded-[10px] bg-[var(--c-surface)] border-none text-[16px] outline-none"
                />
              </div>
            </div>
          )}
          {cycleType === 'weekly' && (
            <div className="mt-5">
              <div className="text-[13px] text-[var(--c-sub)] mb-1.5">Starts on</div>
              <div className="flex gap-1.5">
                {WEEKDAY_ABBR.map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCycleStartDayOfWeek(idx)}
                    className="flex-1 py-2.5 rounded-[10px] text-[13px] cursor-pointer"
                    style={{
                      background: 'var(--c-surface)',
                      color: cycleStartDayOfWeek === idx ? 'var(--c-accent)' : 'var(--c-text)',
                      border: cycleStartDayOfWeek === idx ? '1px solid var(--c-accent)' : '1px solid transparent',
                      fontWeight: cycleStartDayOfWeek === idx ? 500 : 400,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1" />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex-1 p-4 rounded-xl bg-transparent text-[var(--c-text)] border border-[var(--c-surface)] text-[16px] font-medium cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(2)}
              className="flex-1 p-4 rounded-xl text-[16px] font-medium border-none cursor-pointer"
              style={{ background: 'var(--c-accent)', color: 'var(--c-on-accent)' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col min-h-[calc(100dvh-40px)] px-6 py-8 box-border">
          <div className="text-[13px] text-[var(--c-sub)] tracking-wide mb-3">Step 3 of 3</div>
          <div className="text-[26px] font-medium mb-1 leading-tight">Add your first categories</div>
          <div className="text-[14px] text-[var(--c-sub)] mb-2">Create at least one to get started.</div>

          <div className="flex flex-col gap-2 mt-4">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 py-3 px-1">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                <div className="flex-1 text-[16px]">{cat.name}</div>
                <button
                  onClick={() => removeCategory(cat.id)}
                  className="flex items-center justify-center p-1.5 bg-transparent border-none text-[var(--c-sub)] cursor-pointer"
                >
                  <XMarkIcon className="w-[18px] h-[18px]" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 py-3 px-1 border-t border-[var(--c-surface)] mt-1">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: nextColor }} />
            <input
              placeholder="Category name"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCategory();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-[16px]"
            />
            <button
              onClick={addCategory}
              disabled={!newCatName}
              className="flex items-center justify-center p-1.5 bg-transparent border-none text-[var(--c-sub)] disabled:cursor-not-allowed"
            >
              <PlusIcon className="w-[18px] h-[18px]" />
            </button>
          </div>

          <div className="flex-1" />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 p-4 rounded-xl bg-transparent text-[var(--c-text)] border border-[var(--c-surface)] text-[16px] font-medium cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={finish}
              disabled={categories.length === 0}
              className="flex-1 p-4 rounded-xl text-[16px] font-medium border-none disabled:cursor-not-allowed"
              style={{
                background: categories.length ? 'var(--c-accent)' : 'var(--c-surface)',
                color: categories.length ? 'var(--c-on-accent)' : 'var(--c-sub)',
              }}
            >
              Start using Margin
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
