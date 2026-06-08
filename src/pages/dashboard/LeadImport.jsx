import { useState } from 'react'
import * as XLSX from 'xlsx'
import DashboardLayout from '../../components/Layout/DashboardLayout'
import API from '../../api/axios'

const EXPECTED_COLUMNS = [
  { key: 'full_name', label: 'Full Name', required: true },
  { key: 'phone_number', label: 'Phone Number', required: true },
  { key: 'email', label: 'Email', required: false },
  { key: 'city', label: 'City', required: false },
  { key: 'ad_name', label: 'Ad Name', required: false },
  { key: 'campaign_name', label: 'Campaign Name', required: false },
  { key: 'created_time', label: 'Date Created', required: false },
]

export default function LeadImport() {
  const [step, setStep] = useState('upload')
  const [leads, setLeads] = useState([])
  const [companies, setCompanies] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [columnMap, setColumnMap] = useState({})
  const [fileColumns, setFileColumns] = useState([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [fileName, setFileName] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = async (evt) => {
      const data = evt.target.result
      const workbook = XLSX.read(data, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 })

      if (rows.length < 2) {
        alert('Excel file is empty or has no data rows')
        return
      }

      const headers = rows[0].map((h) => String(h).trim())
      setFileColumns(headers)

      // Auto-map columns
      const autoMap = {}
      EXPECTED_COLUMNS.forEach((col) => {
        const match = headers.find((h) =>
          h.toLowerCase().includes(col.key.replace('_', ' ')) ||
          h.toLowerCase().includes(col.label.toLowerCase()) ||
          h.toLowerCase() === col.key
        )
        if (match) autoMap[col.key] = match
      })
      setColumnMap(autoMap)

      // Parse data rows
      const parsed = rows.slice(1).filter((row) => row.some((cell) => cell)).map((row) => {
        const obj = {}
        headers.forEach((h, i) => { obj[h] = row[i] || '' })
        return obj
      })
      setLeads(parsed)

      // Fetch companies
      try {
        const res = await API.get('/admin/companies')
        setCompanies(res.data)
      } catch (err) {
        console.error(err)
      }

      setStep('map')
    }
    reader.readAsBinaryString(file)
  }

  const handleImport = async () => {
    if (!selectedCompany) return alert('Please select a company')
    const missing = EXPECTED_COLUMNS.filter(
      (c) => c.required && !columnMap[c.key]
    )
    if (missing.length > 0) {
      return alert(`Please map required columns: ${missing.map((m) => m.label).join(', ')}`)
    }

    setImporting(true)
    try {
      const mappedLeads = leads.map((row) => ({
        name: row[columnMap['full_name']] || '',
        phone: row[columnMap['phone_number']] || '',
        email: row[columnMap['email']] || '',
        city: row[columnMap['city']] || '',
        adName: row[columnMap['ad_name']] || '',
        campaignName: row[columnMap['campaign_name']] || '',
        source: 'Meta',
      })).filter((l) => l.name && l.phone)

      const res = await API.post('/leads/import', {
        leads: mappedLeads,
        companyId: parseInt(selectedCompany)
      })

      setImportResult(res.data)
      setStep('done')
    } catch (err) {
      alert(err.response?.data?.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleReset = () => {
    setStep('upload')
    setLeads([])
    setColumnMap({})
    setFileColumns([])
    setSelectedCompany('')
    setImportResult(null)
    setFileName('')
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Import leads</h1>
        <p className="text-gray-500 text-sm mt-1">Upload your Meta leads Excel file</p>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['upload', 'map', 'done'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step === s
                ? 'bg-purple-600 text-white'
                : ['upload', 'map', 'done'].indexOf(step) > i
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}>
              {['upload', 'map', 'done'].indexOf(step) > i ? '✓' : i + 1}
            </div>
            <span className={`text-sm ${step === s ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
              {s === 'upload' ? 'Upload file' : s === 'map' ? 'Map columns' : 'Done'}
            </span>
            {i < 2 && <div className="w-8 h-px bg-gray-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 1 — Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📊</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload Excel file</h2>
            <p className="text-gray-500 text-sm mb-6">
              Download your leads from Meta Ads Manager and upload the Excel file here
            </p>
            <label className="block">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                <div className="text-4xl mb-2">📂</div>
                <div className="text-sm font-medium text-gray-700">Click to upload Excel file</div>
                <div className="text-xs text-gray-400 mt-1">.xlsx or .xls files only</div>
              </div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* Step 2 — Map columns */}
      {step === 'map' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Map columns</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  File: <span className="font-medium">{fileName}</span> — {leads.length} leads found
                </p>
              </div>
            </div>

            {/* Company selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Import leads for company
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full max-w-xs px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select company...</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Column mapping */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Column mapping</h3>
              {EXPECTED_COLUMNS.map((col) => (
                <div key={col.key} className="flex items-center gap-4">
                  <div className="w-40 text-sm text-gray-700">
                    {col.label}
                    {col.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-gray-400 text-sm">→</div>
                  <select
                    value={columnMap[col.key] || ''}
                    onChange={(e) => setColumnMap({ ...columnMap, [col.key]: e.target.value })}
                    className="flex-1 max-w-xs px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Not mapped</option>
                    {fileColumns.map((fc) => (
                      <option key={fc} value={fc}>{fc}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">
                Preview (first 5 rows)
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {fileColumns.map((col) => (
                      <th key={col} className="text-left text-xs font-medium text-gray-500 px-4 py-2 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {fileColumns.map((col) => (
                        <td key={col} className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                          {row[col] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {importing ? 'Importing...' : `Import ${leads.length} leads`}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Done */}
      {step === 'done' && importResult && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Import complete!</h2>
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total rows</span>
              <span className="font-medium">{importResult.total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Imported</span>
              <span className="font-medium text-green-600">{importResult.imported}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Skipped (duplicates)</span>
              <span className="font-medium text-amber-600">{importResult.skipped}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Import more
            </button>
            <button
              onClick={() => window.location.href = '/dashboard/leads'}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              View leads
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}