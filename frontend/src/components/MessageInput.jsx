import React, { useRef, useState,useEffect } from 'react'
import { useChatStore } from '../store/useChatStore'
import { Image, Send, X } from 'lucide-react'
import { toast } from 'react-hot-toast'

function MessageInput() {
    const [text,setText] =useState("")
    const [imagePreview,setImagePreview]=useState(null)
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSending, setIsSending] = useState(false)
    
    const fileInputRef = useRef(null)
    const inputRef = useRef(null)
    const typingTimeoutRef = useRef(null);


    const {sendMessage} = useChatStore()
    const {emitTyping, emitStopTyping} = useChatStore();

    // emitTyping();
    // clearTimeout(typingTimeoutRef.current)
    // typingTimeoutRef.current = setTimeout(() => {
    //   emitStopTyping();
    // }, 1500);


    useEffect(() => {
    if (!imagePreview) {
        setPreviewUrl(null);
        return;
    }
    

    const url = URL.createObjectURL(imagePreview);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url); // prevents memory leak
    }, [imagePreview]);


    const handleImageChange = (e) => {
      const file = e.target.files?.[0]

      if (!file || !file.type?.startsWith("image/")) {
          toast.error("Please select a valid image.")
          return
      }
      
      // const reader = new FileReader()
      // reader.onloadend =()=>{
      //   setImagePreview(reader.result)
      // }
      // reader.readAsDataURL(file)
      setImagePreview(file);
    }

    const removeImage = () => {
      setImagePreview(null)
      if(fileInputRef.current) fileInputRef.current.value = null
    }

    const handleSendMessage = async (e) => {
      e?.preventDefault()
      
      if (isSending) return
      if(!text.trim() && !imagePreview) return

      const messageText = text.trim();
      const imageFile = imagePreview;

      try {
        setIsSending(true)
        await sendMessage({
          text: messageText,
          image: imageFile,
        });
        emitStopTyping();
        setText("")
        setImagePreview(null)

        inputRef.current.style.height = "auto";
        if(fileInputRef.current) fileInputRef.current.value = null

        inputRef.current?.focus()
      } catch (error) {
        console.error("Error sending message:", error)
        toast.error("Failed to send message. Please try again.")
      }finally {
        setIsSending(false)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); 
        handleSendMessage(); 
      }
    };


  return (
  <div className="relative border-t border-base-300 p-3 bg-base-100">

    {/* IMAGE PREVIEW — WhatsApp style */}
    {previewUrl && (
      <div className="absolute bottom-full left-3 mb-2 bg-base-200 p-2 rounded-xl shadow-lg">
        <div className="relative w-20 h-20">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />

          <button
            onClick={removeImage}
            type="button"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>
    )}

    {/* INPUT FORM */}
    <form onSubmit={handleSendMessage} className="flex items-end gap-2">

      {/* TEXTAREA */}
      <textarea
        ref={inputRef}
        rows={1}
        placeholder="Type a message..."
        value={text}
        onChange={(e) => {
          setText(e.target.value);

          e.target.style.height = "auto";
          e.target.style.height = e.target.scrollHeight + "px";

          emitTyping();
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            emitStopTyping();
          }, 1200);
        }}
        onKeyDown={handleKeyDown}
        className="flex-1 textarea textarea-bordered rounded-xl resize-none overflow-hidden min-h-[42px] max-h-[120px]"
      />

      {/* FILE INPUT */}
      <input
        type="file"
        accept="image/*"
        hidden
        ref={fileInputRef}
        onChange={handleImageChange}
      />

      {/* IMAGE BUTTON */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`btn btn-circle ${
          imagePreview ? "text-emerald-500" : "text-zinc-400"
        }`}
      >
        <Image size={20} />
      </button>

      {/* SEND BUTTON */}
      <button
        type="submit"
        className="btn btn-circle btn-primary"
        disabled={isSending || (!text.trim() && !imagePreview)}
      >
        <Send size={20} />
      </button>

    </form>
  </div>
);
}
export default MessageInput