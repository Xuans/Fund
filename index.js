(function(global,undefined){

const callback='cb123';
const type='CT';
const token='4f1862fc3b5e77c150a2b985b12db0fd';
const sty='FCOIATC';
const js='(%7Bdata%3A%5B(x)%5D%2CrecordsFiltered%3A(tot)%7D)';
const cmd='C._A&st=(PERation)';
const start=1;
const initPage=1;
const pageLength=20;
const timestamp=new Date().getTime();


(new Promise(async (resolve)=>{

    let data=[];
    let page=initPage;

    const load= await new Promise(r=>{
        $.ajax({ 
            type:"get",
            url:`http://nufm.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?cb=${callback}&type=${type}&token=${token}&sty=${sty}&js=${js}&cmd=${cmd}&sr=${start}&p=${page}&ps=${pageLength}&_=${timestamp}`,/*url写异域的请求地址*/
            dataType:"jsonp",/*加上datatype*/
            jsonpCallback:callback,/*设置一个回调函数，名字随便取，和下面的函数里的名字相同就行*/
            success(response){
                r(response);
            }
        });
    });

    if(load && load.data){
        data=data.concat(load.data.map(e=>e.split(',')));
    }
    

    console.log(load);

    resolve(data);

    debugger;
})).then(response=>{

});




}(this));