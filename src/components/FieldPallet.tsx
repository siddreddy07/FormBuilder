import { Calculator, Calendar1, CheckLine, CircleDot, Hash, List, Menu, TextSelect } from "lucide-react";
import { useState } from "react"
import { useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import { useSelector } from "react-redux";
import { addSelectedItem } from "../redux/Paletteslice";

const FieldPallet = () => {

    const [field,setfield] = useState<String>('')

    const dispatch = useDispatch<AppDispatch>()

    const palette = useSelector((state:RootState)=>state.palette.palette)
    const selectedForm = useSelector(
    (state: RootState) => state.palette.storedData.forms[state.palette.selectedFormIndex]
  );

    console.log("Selected : ",selectedForm)

      const iconsMap: Record<string, React.JSX.Element> = {
    "Single-line Text": <TextSelect />,
    "Number Input": <Hash />,
    "Multiline Text": <Menu />,
    "Dropdown Select": <List />,
    "Radio Button Group": <CircleDot />, // replace with appropriate icon
    "Checkbox Group": <CheckLine />, // replace with appropriate icon
    "Date Picker": <Calendar1 />, // replace with appropriate icon
    "Derived Field": <Calculator />, // replace with appropriate icon
  };

  const handlepalleteClick = (item:string)=>{
    dispatch(addSelectedItem(item))
  }


  return (
    <div className="w-full flex flex-col items-center justify-center gap-4 h-full">
        {
            palette.map((item,index)=>(
                <button onClick={()=>{handlepalleteClick(item)}} className="p-2 font-semibold border-1 border-zinc-700 text-start cursor-pointer flex items-center gap-4 hover:text-zinc-200 hover:bg-zinc-800 bg-zinc-900/50 w-full rounded-md text-zinc-300 text-lg" key={index}>{iconsMap[item]}{item}</button>
            ))
        }
    </div>
  )
}

export default FieldPallet