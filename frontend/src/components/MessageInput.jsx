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
    const lastTypingTimeRef = useRef(0);

    const {sendMessage, emitTyping, emitStopTyping} = useChatStore();




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

      if (file.size > 5 * 1024 * 1024) {
          toast.error("Image must be less than 5MB");
          return;
      }
      

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
    <div className="relative border-t border-base-content/10 p-3 sm:p-3.5 bg-base-100/60 backdrop-blur-md">
      
      {/* IMAGE PREVIEW — Floating glass card */}
      {previewUrl && (
        <div className="absolute bottom-full left-4 mb-3 bg-base-100/90 backdrop-blur-xl p-2 rounded-2xl shadow-xl border border-base-content/10 animate-fadeIn">
          <div className="relative size-20">
            <img
              src={previewUrl}
              alt="Preview"
              className="size-full object-cover rounded-xl"
            />
            <button
              onClick={removeImage}
              type="button"
              className="absolute -top-2 -right-2 size-6 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer"
              title="Remove image"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* INPUT FORM */}
      <form onSubmit={handleSendMessage} className="flex items-end gap-2 max-w-4xl mx-auto">
        
        {/* FILE INPUT */}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        {/* IMAGE ATTACH BUTTON */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`btn btn-circle btn-sm sm:btn-md btn-ghost hover:bg-base-200 transition-all shrink-0 cursor-pointer ${
            imagePreview ? "text-emerald-500 bg-emerald-500/10" : "text-base-content/50 hover:text-base-content"
          }`}
          title="Attach image"
          aria-label="Attach image"
        >
          <Image className="size-5" />
        </button>

        {/* TEXTAREA */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);

              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";

              const now = Date.now();
              if (!lastTypingTimeRef.current || now - lastTypingTimeRef.current > 1500) {
                emitTyping();
                lastTypingTimeRef.current = now;
              }

              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                emitStopTyping();
                lastTypingTimeRef.current = 0;
              }, 1500);
            }}
            onKeyDown={handleKeyDown}
            className="w-full textarea textarea-bordered rounded-2xl resize-none overflow-hidden min-h-[44px] max-h-[130px] bg-base-200/60 focus:bg-base-100 border-base-content/10 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 text-sm py-2.5 px-4 transition-all leading-relaxed"
          />
        </div>

        {/* SEND BUTTON */}
        <button
          type="submit"
          className="btn btn-circle btn-sm sm:btn-md bg-gradient-to-tr from-primary to-accent text-primary-content shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all shrink-0 disabled:opacity-40 disabled:hover:scale-100 cursor-pointer border-0"
          disabled={isSending || (!text.trim() && !imagePreview)}
          title="Send message"
          aria-label="Send message"
        >
          <Send className="size-4.5" />
        </button>

      </form>
    </div>
  );
}
export default MessageInput