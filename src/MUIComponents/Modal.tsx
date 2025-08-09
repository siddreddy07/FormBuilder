import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../redux/store';
import { setFormName } from '../redux/Paletteslice';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#18181b',
  boxShadow: 24,
  p: 4,
};

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);

  const [formname, setformname] = React.useState<string>("");

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const dispatch = useDispatch<AppDispatch>()

  const handleSubmit = () => {

    console.log(formname)



    if(formname.trim() != ''){
        console.log("Formname : ",formname)
        dispatch(setFormName(formname))
        handleClose()
    }

  }



  return (
    <div>
      <Button onClick={handleOpen}>Save Form</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} color={'white'}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Enter Form Name
          </Typography>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            <input type="text" value={formname} onChange={(e)=>setformname(e.target.value)} placeholder='Enter Form Name' className='w-full rounded-md px-2 border-2 border-zinc-300' />
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            <button onClick={() => handleSubmit()} className='bg-zinc-200 text-zinc-800 py-2 px-4 rounded-md cursor-pointer hover:bg-zinc-800 shadow-md hover:transition-all ease-linear duration-300 hover:text-zinc-200 font-semibold hover:font-bold'>
                Save
            </button>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
}
