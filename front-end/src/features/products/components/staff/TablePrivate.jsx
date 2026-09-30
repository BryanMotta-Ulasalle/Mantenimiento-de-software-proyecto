

const TablePrivate = ({ columns, data }) => {

    const getValue = (row, key) => {
        return key.split(".").reduce((acc, part) => acc?.[part], row)
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-300 bg-white">
            <table className="w-full min-w-180 border-collapse">
                <thead className="">
                    <tr className="border-b border-gray-200 text-left">
                        {columns.map((column) => (
                            <th key={column.key} className="whitespace-nowrap px-5 py-3 text-gray-400"
                            >{column.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 last:border-b-0">
                            {columns.map((column) => {
                                const value = getValue(row, column.key)
                                return (
                                    <td key={column.key} className="px-5 py-4">
                                        {column.render ? column.render(value, row) : value}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TablePrivate
