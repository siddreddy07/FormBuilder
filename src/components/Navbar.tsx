import { Grid2x2, Plus } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const Navbar = () => {

const navigate = useNavigate()
  const handlenavigate = (name:string)=>{
    navigate(`/${name}`)
  }

  return (
    <div className="w-full top-0 bg-zinc-900 z-50 border-b-zinc-400 border-b-2 fixed text-zinc-300 font-bold text-md px-10 h-18 flex items-center justify-between">
        <h1 className="text-2xl">Form Builder</h1>
        <div className="flex items-center justify-between px-20 gap-8">
          
            <button onClick={()=> handlenavigate('create')} className="bg-zinc-900 cursor-pointer hover:text-white p-2 rounded-md hover:transition-all duration-300 ease-linear"><h1 className="flex items-center justify-center gap-2"><Plus/>Create</h1></button>
          

            <button onClick={()=> handlenavigate('myforms')} className="bg-zinc-900 cursor-pointer hover:text-white hover:bg-zinc-800 p-2 rounded-md hover:transition-all duration-300 ease-linear"><h1 className="flex items-center justify-center gap-2"><Grid2x2 />My Forms</h1></button>

            
        </div>
    </div>
  )
}

export default Navbar