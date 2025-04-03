import { Conversation } from "../models/converstion.model.js";

export const getConversion = async(curretId)=>{
    if(curretId){
     const currentUserConversion = await Conversation.find({
            "$or" : [
                { sender : curretId },
                { receiver : curretId }
            ]
        }).sort({ updatedAt : -1 }).populate('messages').populate('sender').populate('receiver')
        // console.log("currentUserConversion",currentUserConversion);
        const converstion = currentUserConversion.map((conv)=>{
            const countUnseenMsg = conv?.messages?.reduce((preve,curr) => {
                const msgByUserId = curr?.msgByUserId?.toString()

                if(msgByUserId !== curretId){
                    return  preve + (curr?.seen ? 0 : 1)
                }else{
                    return preve
                }
             
            },0)

            return {
                _id : conv?._id,
                sender : conv?.sender,
                receiver : conv?.receiver,
                unseenMsg : countUnseenMsg,
                lastMsg : conv.messages[conv?.messages?.length - 1]
            }
        })    
        return converstion
    }else{
            return []
        }
}
// export default getconversion ;