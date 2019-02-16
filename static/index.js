(function (global, undefined) {
    const callback = 'cb123';
    const type = 'CT';
    const token = '4f1862fc3b5e77c150a2b985b12db0fd';
    const sty = 'FCOIATC';
    const js = '(%7Bdata%3A%5B(x)%5D%2CrecordsFiltered%3A(tot)%7D)';
    const cmd = 'C._A&st=(PERation)';
    const header = ["序号", "代码", "名称", "最新价", "涨跌幅", "涨跌额", "成交量(手)", "成交额", "振幅", "最高", "最低", "今开", "昨收", "量比", "换手率", "市盈率(动态)", "市净率"];
    const ratioIndex = header.findIndex(e => e.toString().indexOf('市盈率') !== -1);
    const rate=10;

    //刷新、加载表格
    const refreshFundInfoHandler=()=>{
        const start = 1;
        const initPage = 1;
        const pageLength = 20;
        const timestamp = new Date().getTime();
    
        (new Promise(async (resolve) => {
    
            let data = [];
            let recordsTotal;
            let page = initPage;
    
            while (true) {
                const load = await new Promise(r => {
                    $.ajax({
                        type: "get",
                        url: `http://nufm.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?cb=${callback}&type=${type}&token=${token}&sty=${sty}&js=${js}&cmd=${cmd}&sr=${start}&p=${page}&ps=${pageLength}&_=${timestamp}`,
                        /*url写异域的请求地址*/
                        dataType: "jsonp",
                        /*加上datatype*/
                        jsonpCallback: callback,
                        /*设置一个回调函数，名字随便取，和下面的函数里的名字相同就行*/
                        success(response){
                            r(response)
                        }
                    });
                });
    
                if (load && load.data) {
                    const pageData = load.data
                        .map(e => {
                            let ret=e.split(',').slice(0, header.length+1);
    
                            ret.splice(ratioIndex-1,1);
    
                            return ret;
                        })
                        .filter(e => parseFloat(e[ratioIndex]) <= rate);
    
                    data = data.concat(pageData);
    
                    recordsTotal = load.recordsFiltered;
    
                    if (pageData.length === pageLength) {
                        page++;
                    } else {
                        break;
                    }
                }
            }
    
            resolve({
                recordsTotal: recordsTotal,
                data: data.map((e,i)=>{
                    e[0]=i;
                    return e;
                })
            });
        })).then(response => {
            const recordsTotal = response.recordsTotal;
            const data = response.data;
            const str = `
            <scroll-view style="height:100%;flex-direction:column;">
                <text>总条数：${recordsTotal}，市盈率小于等于${rate}的总条数：${data.length}</text>
                <div class="scroll-content">
                    <table class="fund" style="width:auto;">
                        <thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead>
                        <tbody>
                            ${data.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}
                        </tbody>
                    </table>
                </div>
                <text>更新时间：${new Date().toLocaleString()}</text>
            </scroll-view>
        `;
    
            $('fund')
                .empty()
                .append(str);
        });
    };

    //1分钟刷新一次
    //setInterval(refreshFundInfoHandler,1*60*1000);
    refreshFundInfoHandler();
}(this));