import CategoryCard from "./CategoryCard"
import EmptyState from "../../../components/EmptyState"


const CategoryGrid = ({categories}) => {

    if (categories.length === 0){
        return <EmptyState title="No hay categorias disponibles" description="Vuelve a intentarlo mas tarde." />
    }
  return (
    <div className="grid grid-cols-2 gap-7 lg:flex flex-row">
      {categories.map((category)=>(
        <CategoryCard key={category.id} category={category.name} count={category.total_products}/>
      ))}
    </div>
  )
}

export default CategoryGrid
