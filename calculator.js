let onInputChange=(()=>{
	let cur=document.getElementById('currnetTime');
	let res=document.getElementById('restTime');
	let out=document.getElementById('output');
	return ()=>{
		let cur_t=getTimestamp(cur.value);
		let res_t=getTimestamp(res.value);
		if(cur_t===null || res_t===null) {
			out.textContent='';
			return;
		}
		let t=cur_t+res_t-5400;
		t=(t/3600|0)+':'+(t%3600/60|0)+':'+(t%60);
		out.textContent=t;
	}
	function getTimestamp(str)
	{
		let mch=str.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})$/);
		if(mch===null) {
			return null;
		}
		return parseInt(mch[1],10)*3600+parseInt(mch[2],10)*60+parseInt(mch[3],10);
	}
})();

let inputs=document.querySelectorAll('input');
for(let k=inputs.length;--k>=0;) {
	let ele=inputs[k];
	console.log(ele);
	ele.addEventListener('change',onInputChange);
}