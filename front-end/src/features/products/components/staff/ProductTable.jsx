// STAFF COMPONENT 
import TablePrivate from "./TablePrivate"
import EmptyState from "../../../../components/EmptyState"

const ProductTable = ({
  products,
  columns,
  emptyTitle = "No hay productos registrados",
  emptyDescription = "Los productos creados apareceran aqui.",
}) => {

    if (products.length === 0){
        return <EmptyState title={emptyTitle} description={emptyDescription} />
    }

  return (
    <div>
        <TablePrivate data={products} columns={columns}/>
    </div>
  )
}

export default ProductTable
