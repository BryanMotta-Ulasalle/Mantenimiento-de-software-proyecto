import H5 from "../../../components/H5"
import P from "../../../components/P"

const CategoryCard = ({category,count}) => {
  return (
    <div className="w-40 h-30 bg-white rounded-lg shadow-lg hover:shadow-xl hover:border border-golden flex flex-col gap-2 justify-center items-center">
      <H5>
        {category}
      </H5>
      <P>
        {count} articulos
      </P>
    </div>
  )
}

export default CategoryCard