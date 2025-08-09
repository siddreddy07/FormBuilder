import { Outlet } from "react-router-dom"
import Navbar from "./components/Navbar"


const Layout = () => {
  return (
    <div className="w-full h-full flex-col items-center">
        <Navbar/>

        <main className="w-full">
            <Outlet/>
        </main>
    </div>
  )
}

export default Layout