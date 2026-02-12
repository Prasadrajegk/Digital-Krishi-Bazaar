import Navbar from "./Navbar"
import Footer from "./Footer"
import { Outlet } from "react-router-dom"
import AiChatWidget from "../../ai_chat_bot/AiChatWidget";


const MainLayout = () => {
  return (
    <>
     <div className="app-wrapper">
      <Navbar/>
      <Outlet />
      <Footer />
      <AiChatWidget />
     </div>
     
    </>
  )
}

export default MainLayout
