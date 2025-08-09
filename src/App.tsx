import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./Layout"
import Homepage from "./pages/Homepage"
import FormPreview from "./components/FormPreview"
import FormList from "./pages/myforms"

function App() {

  return (
    <div className="w-full h-full bg-zinc-800">

      <BrowserRouter>

          <Routes>

              <Route path="/" element={<Layout/>}>
                <Route path="/create" element={<Homepage/>}/>
                <Route path="form/:id" element={<FormPreview/>}/>
                <Route path="/myforms" element={<FormList/>}/>
              </Route>


          </Routes>

      </BrowserRouter>

    </div>
  )
}

export default App
