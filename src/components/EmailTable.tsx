'use client'

type EmailItem = {
  id: string
  subject: string
  snippet: string
  from: string
}

type EmailTableProps = {
  emails?: EmailItem[]
  status: 'idle' | 'loading' | 'success' | 'error'
}

export default function EmailTable({ emails = [], status }: EmailTableProps) {
  return (
    <div className="overflow-auto rounded shadow border border-gray-800 mx-auto bg-[#121212] w-full max-w-7xl px-4">
      <table className="w-full text-sm table-fixed">
        <thead className="bg-gray-800 text-gray-200">
          <tr>
            <th className="p-3 text-left font-semibold w-[120px]">Folders</th>
            <th className="p-3 text-left font-semibold">Select</th>
            <th className="p-3 text-left font-semibold">Name</th>
            <th className="p-3 text-left font-semibold">ID</th>
            <th className="p-3 text-left font-semibold w-[200px]">Subject</th>
            <th className="p-3 text-left font-semibold w-[300px]">Body</th>
            <th className="p-3 text-left font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {status === 'loading' && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-yellow-400">🔄 Loading emails...</td>
            </tr>
          )}
          {status === 'error' && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-red-500">❌ Error loading inbox</td>
            </tr>
          )}
          {status === 'success' && emails.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-400">📭 No emails found</td>
            </tr>
          )}

          {/* Render folders once, on the first row */}
          {status === 'success' && emails.map((email, idx) => (
            <tr key={email.id} className="border-t border-gray-700 hover:bg-gray-800 transition">
              {/* Folders column only on first row with rowSpan */}
              {idx === 0 && (
                <td rowSpan={emails.length} className="align-top p-3 text-sm text-white bg-black border-r border-gray-700">
                  <div className="space-y-2">
                    <div className="font-semibold mb-2">📁 Folders</div>
                    <ul className="space-y-1">
                      <li className="hover:font-semibold cursor-pointer">📥 Inbox</li>
                      <li className="hover:font-semibold cursor-pointer">📤 Sent</li>
                      <li className="hover:font-semibold cursor-pointer">📝 Drafts</li>
                      <li className="hover:font-semibold cursor-pointer">⚠️ Spam</li>
                      <li className="hover:font-semibold cursor-pointer">🗑️ Trash</li>
                    </ul>
                  </div>
                </td>
              )}

              <td className="p-3">
                <input type="checkbox" className="form-checkbox text-blue-500" />
              </td>
              <td className="p-3 whitespace-nowrap">{email.from?.split('<')[0].trim() || 'Unknown'}</td>
              <td className="p-3 text-xs text-gray-400">{email.id?.slice(0, 8)}</td>
              <td className="p-3 font-medium truncate">{email.subject || '(No Subject)'}</td>
              <td className="p-3 text-gray-300 whitespace-nowrap overflow-hidden text-ellipsis">
                {email.snippet || '(No body)'}
              </td>
              <td className="p-3 text-xs text-gray-400 whitespace-nowrap">
                {new Date().toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}