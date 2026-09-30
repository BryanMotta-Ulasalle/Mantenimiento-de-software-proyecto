import H5 from "../../../components/H5"
import P from "../../../components/P"

const NameProfile = ({name, email, role}) => {
    return (
        <div className="flex flex-row gap-5 bg-white p-7 rounded-xl border border-gray-200">
            <div className="w-15 h-15 rounded-xl bg-gray-400">
                <img src="" alt="" />
            </div>
            <div>
                <H5>{name}</H5>
                <P>{email}</P>
                <div>
                    <span className='mt-2 w-fit text-sm bg-orange-100 text-orange-700 px-2 rounded-lg'>{role}</span>
                </div>
            </div>
        </div>
    )
}

export default NameProfile
