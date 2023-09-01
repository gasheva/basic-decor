import basicDecor from "@/services/basic-decor";

export const useRequests = ()=>{
    const fetch = ()=> {
        return basicDecor.get('/favorite').then((resp)=>{
            return resp;
        })
    }

    return {fetch}
}