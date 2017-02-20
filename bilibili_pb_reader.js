let arrayBuffer=function(data){
	let uintarray=new Uint8Array(data),offset=0,length=uintarray.length;
	data.getuint8=function(){
		let uint8=uintarray[offset];
		offset++;
		return uint8;
	}
	data.getstring=function(length){
		let arr=[],i=0;
		for(;i<length;i++){
			arr.push(uintarray[offset+i]);
		}
		offset+=length;
		return decodeURIComponent(escape(String.fromCharCode.apply(null,arr)));
	}
	data._slice=function(length){
		let cut=data.slice(offset,length+offset);
		offset+=length;
		return cut;
	}
	data.eof=function(){
		return offset>=length;
	}
	data.offset=function(){return offset};
	return data;
},
int32touint32=new ArrayBuffer(4),
int32in=new Int32Array(int32touint32),
uint32out=new Uint32Array(int32touint32),
readVarInt32=(src)=>{
	let b,result=0,i=0;
	for(;i<5;i++){
		b=src.getuint8();
		result |= (b & 0x7f) << (i*7);
		if(!( b & 0x80 ))
			break;
	}
	int32in[0]=result;
	return uint32out[0];
},
readString=(src)=>{
	let strLen=readVarInt32(src);
	return src.getstring(strLen);
},
readFloat=(src)=>{
	let float=new Float32Array(src._slice(4))
	return float[0];
}
document.head.innerHTML='<meta charset="UTF-8"><style>body{background:#EEE}table{border-collapse:collapse}td{padding:2px 5px;border:1px solid #666}</style>';
document.body.innerHTML='';
fetch(location.href/*,{credentials:'include'}*/).then(
	(r)=>{
		r.arrayBuffer().then(
			(data)=>{
				data=new arrayBuffer(data);
				let rows=[],outputDatas=[];
				while(!data.eof()){
					let id=data.getuint8(),type=id&7;
					id = id>>>3;
					switch(id){
						case 1:
							let row={},rowLen=readVarInt32(data),rowData=new arrayBuffer(data._slice(rowLen));
							while(!rowData.eof()){
								id=rowData.getuint8(),type=id&7;
								id = id>>>3;
								switch(id){
									case 1:
										row.playTime=readFloat(rowData);
									break;
									case 2:
										row.mode=readVarInt32(rowData);
									break;
									case 3:
										row.fontsize=readVarInt32(rowData);
									break;
									case 4:
										row.color=readVarInt32(rowData).toString(16).padStart(6,'0');
									break;
									case 5:
										row.timestamp=readVarInt32(rowData);
									break;
									case 6:
										row.pool=readVarInt32(rowData);
									break;
									case 7:
										row.hash=readString(rowData);
									break;
									case 8:
										row.dmid=readVarInt32(rowData);
									break;
									case 9:
										row.msg=readString(rowData);
									break;
									case 10:
										row.uid=readVarInt32(rowData);
									break;
									case 11:
										row.uname=readString(rowData);
									break;
								}
							}
							rows.push(row);
						break;
						case 2:
							outputDatas.push( '[chat_server]=>' + readString(data));
						break;
						case 3:
							outputDatas.push( '[chat_id]=>' + readVarInt32(data));
						break;
						case 4:
							outputDatas.push( '[mission]=>' + readVarInt32(data));
						break;
						case 5:
							outputDatas.push( '[max_limit]=>' + readVarInt32(data));
						break;
						case 6:
							outputDatas.push( '[source]=>' + readString(data));
						break;
						case 7:
							outputDatas.push( '[ds]=>' + readVarInt32(data));
						break;
						case 8:
							outputDatas.push( '[de]=>' + readVarInt32(data));
						break;
						case 9:
							outputDatas.push( '[max_count]=>' + readVarInt32(data));
						break;
						case 10:
							outputDatas.push( '[realname]=>' + readVarInt32(data));
						break;
						case 11:
							outputDatas.push( '[sectionlen]=>' + readVarInt32(data));
						break;
						case 12:
							outputDatas.push( '[duration]=>' + readFloat(data));
						break;
						case 13:
							outputDatas.push( '[total_count]=>' + readVarInt32(data));
						break;
						case 14:
							outputDatas.push( '[pb_version]=>' + readVarInt32(data));
						break;
						default:
							switch(type){
								case 0:
									console.log( '--Unknown ID '+id+' with varint32 value '.readVarInt32(data));
								break;
								case 1:
									console.log( '--Unknown ID '+id+' with fixed 64bit data hex '+encodeURIComponent(data.getstring(8)).replace(/%/g,''));
								break;
								case 5:
									console.log( '--Unknown ID '+id+' with fixed 32bit data hex '+encodeURIComponent(data.getstring(4)).replace(/%/g,''));
								break;
								default:
									console.log( '--Unknown ID '+id+' with type '+type);
							}
					}
				}
				let rowsData=['<table><tbody><tr style="text-align:center"><td>playTime</td><td>mode</td><td>size</td><td>color</td><td>timestamp</td><td>pool</td><td>hash</td><td>dmid</td><td>msg</td></tr>'];
				for(row of rows){
					rowsData.push('<tr><td>'+row.playTime+'</td><td>'+row.mode+'</td><td>'+row.fontsize+'</td><td>'+row.color+'</td><td>'+row.timestamp+'</td><td>'+row.pool+'</td><td>'+row.hash+'</td><td>'+row.dmid+'</td><td>'+row.msg+'</td></tr>');
				}
				rowsData.push('</tbody></table>')
				outputDatas.push(rowsData.join(''));
				document.body.innerHTML=outputDatas.join('\n');
				document.body.style.whiteSpace='pre-wrap';
			}
		)
	}
)