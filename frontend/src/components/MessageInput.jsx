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
        <div className="p-4 w-full">

            {/* Image Preview */}
            {previewUrl && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
                        />
                        <button
                            onClick={removeImage}
                            type="button"
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                </div>
            )}


            <form onSubmit={handleSendMessage} className="flex items-center gap-2">

                <div className="flex-1 flex gap-2">

                    {/* ⭐ Recommended: textarea instead of input */}
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
                            
                            clearTimeout(typingTimeoutRef.current)
                            typingTimeoutRef.current = setTimeout(() => {
                              emitStopTyping();
                            }, 1200);
                        }}
                        onKeyDown={handleKeyDown}
                        className="w-full textarea textarea-bordered rounded-lg resize-none overflow-hidden min-h-[40px] max-h-[120px]"
                    />


                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                    />

                    <button
                        type="button"
                        className={`hidden sm:flex btn btn-circle 
                        ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Image size={20} />
                    </button>

                </div>


                {/* Send Button */}
                <button
                    type="submit"
                    className="btn btn-sm btn-circle"
                    disabled={isSending || (!text.trim() && !imagePreview)}
                >
                    <Send size={22} />
                </button>

            </form>
        </div>
    )
}

export default MessageInput