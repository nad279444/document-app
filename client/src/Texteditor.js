import { useCallback, useEffect,useState } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import {io} from 'socket.io-client'
import {useParams} from 'react-router-dom'


const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]
  
export default function Texteditor() {
    const {id: documentId} = useParams()

    const[socket,socketSet] = useState()
    const[quill,quillSet] = useState()
    console.log(documentId)

    useEffect(() => {
        if (socket == null || quill == null) return
        socket.once('load-document',document => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit('get-document',documentId)


    },[socket,quill,documentId])

    useEffect(() => {
        const originalSocket = io('http://localhost:3001')
         socketSet(originalSocket)
        return () => {
            originalSocket.disconnect()
        }
    },[])

    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta) => {
            quill.updateContents(delta)
            
            socket.emit('send-changes',delta)
        }
        socket.on('receive-changes',handler)
        return () => {
        socket.off('receive-changes',handler)
        }
    },[socket,quill])



    useEffect(() => {
        if (socket == null || quill == null) return
        const handler = (delta,oldDelta,source) => {
            if(source !== 'user') return
            socket.emit('send-changes',delta)
        }
        quill.on('text-change',handler)
        return () => {
            quill.off('text-change',handler)
        }
    },[socket,quill])



  const wrapperRef = useCallback(wrapper => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const textQuill = new Quill(editor, { theme: "snow" ,modules:{toolbar: TOOLBAR_OPTIONS}});
    textQuill.disable()
    textQuill.setText('Loading...')
    quillSet(textQuill)
  }, []);
  return (
    <div className ="container" ref={wrapperRef}></div>

  );
}
