import { useState } from 'react'
import { getEntries, addEntry, deleteEntry, totals } from '../store/diary'

export default function DiaryScreen({ t }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((x) => x + 1)

  const [type, setType] = useState('expense')
  const [note, setNote] = useState('')
  const [amount, setAmount] = useState('')

  const entries = getEntries()
  const sum = totals()

  function add(e) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    addEntry({ type, note: note.trim(), amount: Number(amount) })
    setNote(''); setAmount(''); refresh()
  }

  function remove(id) { deleteEntry(id); refresh() }

  return (
    <div className="diary">
      <div className="diary-summary">
        <div className="ds income"><span>{t('income')}</span><b>₹{sum.income}</b></div>
        <div className="ds expense"><span>{t('expense')}</span><b>₹{sum.expense}</b></div>
        <div className={'ds profit' + (sum.profit < 0 ? ' loss' : '')}>
          <span>{sum.profit < 0 ? t('loss') : t('profit')}</span><b>₹{Math.abs(sum.profit)}</b>
        </div>
      </div>

      <form className="diary-form" onSubmit={add}>
        <div className="type-toggle">
          <button type="button" className={type === 'income' ? 'active' : ''} onClick={() => setType('income')}>➕ {t('income')}</button>
          <button type="button" className={type === 'expense' ? 'active' : ''} onClick={() => setType('expense')}>➖ {t('expense')}</button>
        </div>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('diary_note_ph')} />
        <div className="area-row">
          <input className="area-input" type="number" min="0" value={amount}
                 onChange={(e) => setAmount(e.target.value)} placeholder={t('amount')} />
          <button className="btn primary small" type="submit">{t('add')}</button>
        </div>
      </form>

      {entries.length === 0 ? (
        <div className="empty">{t('diary_empty')}</div>
      ) : (
        <ul className="diary-list">
          {entries.map((e) => (
            <li key={e.id} className={'diary-item ' + e.type}>
              <div>
                <span className="di-note">{e.note || (e.type === 'income' ? t('income') : t('expense'))}</span>
                <span className="di-date">{new Date(e.at).toLocaleDateString()}</span>
              </div>
              <div className="di-right">
                <span className="di-amt">{e.type === 'income' ? '+' : '−'}₹{e.amount}</span>
                <button className="di-del" onClick={() => remove(e.id)} aria-label={t('delete')}>🗑️</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
