var st,ft,tt,preview,baha;
function run()
{
	function getTimeStamp(str)
	{
		var i;
		str=str.split(" ");
		str[0]=str[0].split("/");
		str[1]=str[1].split(":");
		str=str[0].concat(str[1]);
		for(i=0;i<str.length;++i)
			str[i]=parseInt(str[i]);
		console.log(str);
		var d=new Date(str[0],str[1]-1,str[2],str[3],str[4],0,0);
		return d.getTime();
	}
	refreshData(getTimeStamp(st.value),getTimeStamp(ft.value),getTimeStamp(tt.value));
}
function show(idx)
{
	var list=document.getElementById("display").children;
	var list2=document.getElementById("tab").children;
	var i;
	for(i=0;i<list.length;++i)
	{
		if(i==idx)
		{
			list[i].removeAttribute("style");
			list2[i].setAttribute("class","selected-tab");
		}
		else
		{
			list2[i].removeAttribute("class");
			list[i].setAttribute("style","display:none");
		}
	}
}
function refreshData(set_t,from_t,to_t)
{
	preview.innerHTML="";
	baha.innerHTML="";
	var t,lt,rec_day,cur_day,A,d;
	d=new Date();
	A=[];
	lt=d.getTimezoneOffset();
	set_t=(set_t/60000|0);
	from_t=(from_t/60000|0);
	to_t=(to_t/60000|0);
	t=set_t-((set_t-from_t)/110|0)*110;
	rec_day=-1;
	for(;t<to_t;t+=110)
	{
		cur_day=((t-lt)/1440|0);
		if(cur_day!=rec_day)
		{
			A.push([]);
			rec_day=cur_day;
		}
		A[A.length-1].push(t);
	}
	//轉換為表格
	var TB=convToTable(A);
	function convToTable(A) //A為依照"日"分類的二維時間戳(到分)陣列
	{//轉換為字串二維陣列
		var nrow=0,ncol=A.length;
		var i,j,k,TB=[[],[]];
		var d_arr=["日","一","二","三","四","五","六"];
		var d=new Date();
		var off=((A[0][0]-d.getTimezoneOffset())%1440/110|0);
		nrow=off+A[0].length;
		for(i=1;i<A.length;++i)
			if(nrow<A[i].length)
				nrow=A[i].length;
		for(i=0;i<A.length;++i)
		{
			d.setTime(A[i][0]*60000);
			TB[0].push();
			TB[0].push("星期"+d_arr[d.getDay()]);
			TB[1].push();
			TB[1].push((d.getMonth()+1)+"月"+d.getDate()+"日");
		}
		for(i=0;i<nrow;++i)
		{
			TB.push([(0<=i-off && i-off<A[0].length?getHM(A[0][i-off]):""),
			         (0<=i-off && i-off<A[0].length?getHM(A[0][i-off]+10):"")]);
			for(j=1;j<ncol;++j)
			{
				TB[i+2].push(i<A[j].length?getHM(A[j][i]):"");
				TB[i+2].push(i<A[j].length?getHM(A[j][i]+10):"");
			}
		}
		return TB;
		function getHM(ts)
		{
			var d=new Date(ts*60000);
			return ("0"+d.getHours()).substr(-2)+":"+("0"+d.getMinutes()).substr(-2);
		}
	}
	//將表格輸出到 preview
	var i,j,tb,tr,td;
	preview.appendChild(tb=document.createElement("table"));
	for(i=0;i<2;++i)
	{
		tb.appendChild(tr=document.createElement("tr"));
		for(j=0;j<TB[i].length;++j)
		{
			tr.appendChild(td=document.createElement("th"));
			td.setAttribute("colspan","2");
			if(i==0)
				td.setAttribute("style","color:#0000DD");
			else
				td.setAttribute("style","color:#339966");
			td.appendChild(document.createTextNode(TB[i][j]));
		}
	}
	d.setTime(A[0][0]*60000);
	t=d.getDay();
	for(;i<TB.length;++i)
	{
		tb.appendChild(tr=document.createElement("tr"));
		for(j=0;j<TB[i].length;++j)
		{
			tr.appendChild(td=document.createElement("td"));
			td.appendChild(document.createTextNode(TB[i][j]));
			td.setAttribute("style","background-color:"+bg_color[(t+(j/2|0))%7]);
		}
	}
	preview.appendChild(tb=document.createElement("p"));
	tb.appendChild(document.createTextNode("可複製貼到試算表"));
	//產生巴哈編碼
	var str="[table cellspacing=0 cellpadding=3 border=1]";
	str+="[tr]";
	for(j=0;j<TB[0].length;++j)
		str+="[td colspan=2 align=center][b][color=#0000DD]"+TB[0][j]+"[/color][/b][/td]";
	str+="[/tr]";
	str+="[tr]";
	for(j=0;j<TB[0].length;++j)
		str+="[td colspan=2 align=center][b][color=#339966]"+TB[1][j]+"[/color][/b][/td]";
	str+="[/tr]";
	d.setTime(A[0][0]*60000);
	t=d.getDay();
	for(i=2;i<TB.length;++i)
	{
		str+="[tr]";
		for(j=0;j<TB[i].length;++j)
		{
			str+="[td align=center bgcolor="+bg_color[(t+(j/2|0))%7]+"]"+TB[i][j]+"[/td]";
			//td.appendChild(document.createTextNode(TB[i][j]));
			//td.setAttribute("style","background-color:"+bg_color[(t+(j/2|0))%7]);
		}
		str+="[/tr]";
	}
	str+="[/table]";
	baha.innerHTML="<textarea cols='80' rows='20'>"+str+"</textarea><p>可貼到巴哈姆特\"原始碼\"</p>";
	//產生圖型版
	drawImg(TB,t);
	function drawImg(TB,start_day)
	{
		var div=document.getElementById("imgview");
		var canvas,ctx;
		var w,h;
		div.innerHTML="";
		div.appendChild(canvas=document.createElement("canvas"));
		canvas.width=w=1+53*TB[0].length*2;
		canvas.height=h=1+27*TB.length;
		ctx=canvas.getContext('2d');
		 ctx.lineWidth=1;
		var i,j;
		ctx.fillStyle="#FFFFFF";
		ctx.fillRect(0.5,0,w,54);
		for(i=0;i<=w;i+=106)
		{
			ctx.fillStyle=bg_color[((i/106|0)+start_day)%7];
			ctx.fillRect(i+0.5,54.5,106,h-54);
		}
		ctx.beginPath();
		for(i=0;i<=w;i+=53)
			{ctx.moveTo(i+0.5,((i/53|0)&1)?54.5:0);ctx.lineTo(i+0.5,h);}
		for(i=0;i<=h;i+=27)
			{ctx.moveTo(0,i+0.5);ctx.lineTo(w,i+0.5);}
		ctx.stroke();
		ctx.fillStyle="#000000";
		//ctx.font-family="PMingLiU,Arial";
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.font="bold 16px Arial,PMingLiU";
		ctx.fillStyle="#0000DD";
		for(j=0;j<TB[0].length;++j)
			ctx.fillText(TB[0][j],j*2*53+54,0*27+14);
		ctx.fillStyle="#339966";
		for(j=0;j<TB[1].length;++j)
			ctx.fillText(TB[1][j],j*2*53+54,1*27+14);
		ctx.fillStyle="#000000";
		ctx.font="16px Arial,PMingLiU";
		for(i=2;i<TB.length;++i)
			for(j=0;j<TB[i].length;++j)
				ctx.fillText(TB[i][j],j*53+27,i*27+14);
		div.appendChild(canvas=document.createElement("p"));
		canvas.appendChild(document.createTextNode("可以右鍵>另存圖片"));
	}
	
}

var bg_color;

function init()
{
	st=document.getElementById("st");
	ft=document.getElementById("ft");
	tt=document.getElementById("tt");
	preview=document.getElementById("preview");
	baha=document.getElementById("baha");
	
	var d=new Date();
	st.value=getTimeStr(d);
	var t=(d.getDay()+5)%7;
	if(t==0 && d.getHours()*60+d.getMinutes()<12*60)
		t=7;
	d.setDate(d.getDate()-t);
	d.setHours(16);
	d.setMinutes(0);
	ft.value=getTimeStr(d);
	d.setDate(d.getDate()+7);
	d.setHours(9);
	tt.value=getTimeStr(d);
	function getTimeStr(dt)
	{
		return [dt.getFullYear(),dt.getMonth()+1,dt.getDate()].join("/")
		       +" "+("0"+dt.getHours()).substr(-2)+":"+("0"+dt.getMinutes()).substr(-2);
	}
	
	var i;
	bg_color=[];
	for(i=0;i<7;++i)
	{
		bg_color.push(HSV2CODE(60+360/7*(i*2+1),0.3,1));
	}
	
	
	function HSV2CODE(h,s,v)
	{
		h=h%360;
		var hi=(h/60|0);
		var f=h/60-hi;
		var p=(v*(1-s)*256|0);
		var q=(v*(1-f*s)*256|0);
		var t=(v*(1-(1-f)*s)*256|0);
		v=(v*256|0);
		
		p=p>255?255:p;
		q=q>255?255:q;
		t=t>255?255:t;
		v=v>255?255:v;
		var r;
		switch(hi)
		{
			case 0:r=toStr(v,t,p);break;
			case 1:r=toStr(q,v,p);break;
			case 2:r=toStr(p,v,t);break;
			case 3:r=toStr(p,q,v);break;
			case 4:r=toStr(t,p,v);break;
			case 5:r=toStr(v,p,q);break;
		}
		return r;
		function toStr(red,green,blue)
		{
			//return [red,green,blue];
			return "#"+("0"+red.toString(16)).substr(-2)+("0"+green.toString(16)).substr(-2)+("0"+blue.toString(16)).substr(-2);
		}
	}
	
	
}
