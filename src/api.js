// ====== Koneksi ke Google Apps Script ======
// Ganti URL ini bila kamu re-deploy Apps Script (URL berubah tiap deployment baru).
export const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbykPENLynouDHr1B64oJFgYiebWBISAksoapbEn9naWp4h742AsI_4rglGTI0M_IfLQ/exec'

/**
 * Catatan CORS:
 * Apps Script tidak mengirim header CORS untuk preflight (OPTIONS).
 * Untuk POST kita pakai Content-Type 'text/plain' supaya browser TIDAK
 * melakukan preflight, sehingga request langsung diterima.
 * `e.postData.contents` di Apps Script tetap berisi JSON string yang bisa di-parse.
 */

async function readJson(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    // Server membalas HTML (bukan JSON). Biasanya karena deployment
    // Apps Script belum publik atau URL-nya salah.
    const looksLikeGoogleError =
      /unable to open the file|Page Not Found|accounts\.google|<html/i.test(text)
    if (looksLikeGoogleError) {
      throw new Error(
        'Server membalas halaman Google, bukan data JSON. ' +
          'Pastikan deployment Apps Script: "Who has access = Anyone", ' +
          '"Execute as = Me", dan URL diakhiri /exec. ' +
          'Tes URL?action=list di jendela Incognito harus menghasilkan JSON.'
      )
    }
    throw new Error('Respons server bukan JSON:\n' + text.slice(0, 200))
  }
}

// GET semua data
export async function listPlayers() {
  const res = await fetch(`${APPS_SCRIPT_URL}?action=list`, { method: 'GET' })
  const json = await readJson(res)
  if (!json.success) throw new Error(json.message || 'Gagal mengambil data')
  return json.data || []
}

// POST create
export async function createPlayer(data) {
  return postAction({ action: 'create', data })
}

// POST update by NIK
export async function updatePlayer(nik, data) {
  return postAction({ action: 'update', nik, data })
}

// POST delete by NIK
export async function deletePlayer(nik) {
  return postAction({ action: 'delete', nik })
}

async function postAction(payload) {
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    // text/plain => menghindari CORS preflight ke Apps Script
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  })
  const json = await readJson(res)
  if (!json.success) throw new Error(json.message || 'Operasi gagal')
  return json
}
