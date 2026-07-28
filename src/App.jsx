import React, { useState } from 'react'
import ChessScene from './ChessScene.jsx'
import { createPlayer } from './api.js'
import logo from './asset/logo.png'

const EMPTY = {
  NAMA: '',
  NIK: '',
  DEPARTEMEN: '',
  ELO: '',
  TELEPON: '',
  SUMBER: '',
}

const SUMBER_OPSI = ['Instagram', 'WhatsApp', 'Teman', 'Poster', 'Departemen', 'Lainnya']

export default function App() {
  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'ok'|'err', msg }

  const showToast = (type, msg) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4500)
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const validate = () => {
    if (!form.NAMA.trim()) return 'Nama wajib diisi'
    if (!form.NIK.trim()) return 'NIK wajib diisi'
    if (form.ELO && isNaN(Number(form.ELO))) return 'ELO harus berupa angka'
    return null
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) return showToast('err', err)

    setSubmitting(true)
    try {
      const payload = { ...form, ELO: form.ELO === '' ? '' : Number(form.ELO) }
      await createPlayer(payload)
      setDone(true)
      showToast('ok', 'Pendaftaran berhasil! Selamat bertanding ♞')
    } catch (e2) {
      showToast('err', e2.message)
    } finally {
      setSubmitting(false)
    }
  }

  const registerAnother = () => {
    setForm(EMPTY)
    setDone(false)
  }

  return (
    <div className="page">
      {/* ===== Background 3D (full screen) ===== */}
      <ChessScene />

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}

      {/* ===== Kolom konten di tengah ===== */}
      <div className="content">
        <header className="page-header">
          <div className="brand">
            <img className="brand-logo" src={logo} alt="Logo Otsuka Chess" />
            <span className="brand-text">OTSUKA CHESS</span>
          </div>
          <h1>
            Turnamen Catur <span className="accent">Otsuka 2026</span>
          </h1>
          <p className="tagline">Raih takhta. Uji strategimu di papan 64 kotak.</p>
        </header>

        <aside className="form-panel">
          <div className="form-inner">
          {done ? (
            <div className="success">
              <div className="success-icon">♛</div>
              <h2>Kamu Terdaftar!</h2>
              <p>
                Terima kasih, <strong>{form.NAMA || 'Grandmaster'}</strong>. Datamu sudah
                tercatat di papan pertandingan. Sampai jumpa di arena!
              </p>
              <button className="btn primary block" onClick={registerAnother}>
                Daftarkan Peserta Lain
              </button>
            </div>
          ) : (
            <>
              <header className="panel-head">
                <div className="hero-badge">♞ PENDAFTARAN PESERTA</div>
                <h2>Formulir Pendaftaran</h2>
                <p className="panel-sub">
                  Isi data dirimu untuk bergabung dalam turnamen.
                </p>
              </header>

              <form onSubmit={onSubmit} className="grid">
                <Field label="Nama Lengkap" required full>
                  <input
                    name="NAMA"
                    value={form.NAMA}
                    onChange={onChange}
                    placeholder="cth. Magnus Wijaya"
                    autoComplete="name"
                  />
                </Field>

                <Field label="NIK" required>
                  <input
                    name="NIK"
                    value={form.NIK}
                    onChange={onChange}
                    placeholder="No. Induk Karyawan"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="Departemen">
                  <input
                    name="DEPARTEMEN"
                    value={form.DEPARTEMEN}
                    onChange={onChange}
                    placeholder="cth. Produksi"
                  />
                </Field>

                <Field label="Rating ELO" hint="Kosongkan jika belum ada">
                  <input
                    name="ELO"
                    value={form.ELO}
                    onChange={onChange}
                    placeholder="cth. 1500"
                    inputMode="numeric"
                  />
                </Field>

                <Field label="No. Telepon">
                  <input
                    name="TELEPON"
                    value={form.TELEPON}
                    onChange={onChange}
                    placeholder="08xxxxxxxxxx"
                    inputMode="tel"
                  />
                </Field>

                <Field label="Sumber Info" full>
                  <select name="SUMBER" value={form.SUMBER} onChange={onChange}>
                    <option value="">— Pilih —</option>
                    {SUMBER_OPSI.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <button type="submit" className="btn primary block" disabled={submitting}>
                  {submitting ? 'Menyimpan…' : 'Daftar Sekarang ♟'}
                </button>
              </form>
            </>
          )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Field({ label, required, hint, full, children }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span className="field-label">
        {label} {required && <em className="req">*</em>}
      </span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}
