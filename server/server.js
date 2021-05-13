const mongoose = require('mongoose')
const Document = require("./DocumentSchema")

mongoose.connect("mongodb://localhost/google-docs", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const defaultValue = ''



const io = require('socket.io')(3001,{
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET","POST"]
    }
})

io.on('connection',(socket) => {
    socket.on('get-document', async documentId => {
        const document = await findorCreateDocument(documentId)
        socket.join(documentId)
        socket.emit('load-document',document.data)

        socket.on('send-changes', delta => {
        socket.broadcast.to(documentId).emit('receive-changes',delta)

        socket.on('save-document', async(data) => {
            await Document.findOneAndUpdate(document.id),{data}
        })
    })
   
    })
    
})

async function findorCreateDocument(id){
    if (id == null) return
    const document = await Document.findById(id)
    if(document) return document
    return await Document.create({_id: id, data: defaultValue})

}
