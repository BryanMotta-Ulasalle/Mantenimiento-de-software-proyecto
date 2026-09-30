import useCategory from "../hooks/useCategory"
import CategoryGrid from "./CategoryGrid"
import H2 from "../../../components/H2"
import LoadingState from "../../../components/LoadingState"
import ErrorMessage from "../../../components/ErrorMessage"

const CategorySection = () => {

  const {categories, isLoading, error} = useCategory()

  if (isLoading) return <LoadingState message="Cargando categorias..." />
  if (error) return <ErrorMessage message={error} className="m-5" />

  return (
    <section className="px-5 py-10 flex flex-col gap-6">
      <H2>
        Compra por categorías
      </H2>
      <CategoryGrid categories={categories}/>
    </section>
  )
}

export default CategorySection
