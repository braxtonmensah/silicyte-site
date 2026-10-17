/** Parser tests. Input parsing is where a tool like this actually fails in the wild. */
const fs = require("fs");
global.window = {};
new Function(fs.readFileSync("C:/Users/bmens/OneDrive - Indiana University/NQ_Project/silicyte/site/assets/audit.js","utf8")).call(global);
const A = global.window.SilicyteAudit;
let pass=0,fail=0;
const ck=(n,c,d)=>{c?(pass++,console.log("  PASS  "+n)):(fail++,console.log("  FAIL  "+n+(d?"  -> "+JSON.stringify(d):"")));};

console.log("\nnormSplit");
["train","TRAIN"," Training ","tr","0"].forEach(v=>ck("train <- "+JSON.stringify(v),A.normSplit(v)==="train",A.normSplit(v)));
["test","TEST","val","valid","validation","dev","holdout","held-out","1","te"].forEach(v=>ck("test <- "+JSON.stringify(v),A.normSplit(v)==="test",A.normSplit(v)));
ck("unknown -> empty", A.normSplit("banana")==="");

console.log("\nparseTable: plain csv");
let r=A.parse("id,sequence,split\np1,ACDEF,train\np2,GHIKL,test\n");
ck("2 rows", r.length===2, r);
ck("ids kept", r[0].id==="p1"&&r[1].id==="p2", r);
ck("uppercased", A.parse("id,sequence,split\np1,acdef,train\np2,ghikl,test\n")[0].seq==="ACDEF");

console.log("\nparseTable: the ways it breaks");
ck("capitalised headers", A.parse("ID,Sequence,Split\np1,ACDEF,train\np2,GHIKL,test\n").length===2);
ck("BOM on header", A.parse("\ufeffid,sequence,split\np1,ACDEF,train\np2,GHIKL,test\n").length===2);
ck("tab delimited", A.parse("id\tsequence\tsplit\np1\tACDEF\ttrain\np2\tGHIKL\ttest\n").length===2);
ck("CRLF line endings", A.parse("id,sequence,split\r\np1,ACDEF,train\r\np2,GHIKL,test\r\n").length===2);
ck("quoted fields with commas", A.parse('id,sequence,split\n"a,b",ACDEF,train\np2,GHIKL,test\n')[0].id==="a,b");
ck("alt column names (peptide/set)", A.parse("name,peptide,set\np1,ACDEF,train\np2,GHIKL,test\n").length===2);
ck("whitespace inside sequence stripped", A.parse("id,sequence,split\np1,AC DE F,train\np2,GHIKL,test\n")[0].seq==="ACDEF");
ck("rows with unknown split are dropped", A.parse("id,sequence,split\np1,ACDEF,train\np2,GHIKL,test\np3,MMMMM,junk\n").length===2);
ck("blank sequence dropped", A.parse("id,sequence,split\np1,,train\np2,GHIKL,test\n").length===1);
ck("no id column -> synthesised", A.parse("sequence,split\nACDEF,train\nGHIKL,test\n")[0].id==="row1");
let e=A.parse("foo,bar\n1,2\n");
ck("missing sequence column errors", !!e.error && /sequence column/.test(e.error), e);
e=A.parse("sequence,label\nACDEF,train\n");
ck("missing split column errors", !!e.error && /split column/.test(e.error), e);
ck("empty file errors", !!A.parse("   ").error || A.parse("   ").length===0);

console.log("\nparseFasta");
r=A.parse(">p1 train\nACDEF\nGH\n>p2 test\nIKLMN\n");
ck("2 records", r.length===2, r);
ck("multiline sequence joined", r[0].seq==="ACDEFGH", r[0]);
ck("split read from header", r[0].split==="train"&&r[1].split==="test", r);
ck("id is first token", r[0].id==="p1", r[0]);
r=A.parse(">p1|train|x\nACDEF\n>p2|test|y\nGHIKL\n");
ck("pipe-delimited header id", r[0].id==="p1", r[0]);

console.log("\nend to end: parse -> audit -> corrected is clean");
const csv="id,sequence,split\n"
 +"t1,MKTAYIAKQRQISFVKSHFSRQ,train\n"
 +"t2,WWRRLLKKGGAAVVPPFFDDEE,train\n"
 +"t3,CSTNQYHGPLIVMFWAKRDECS,train\n"
 +"x1,MKTAYIAKQRQISFVKSHFSRQ,test\n"
 +"x2,WWRRLLKKGGAAVVPPFFDDEX,test\n"
 +"x3,QQQQNNNNIIIIYYYYFFFFTT,test\n";
const rows=A.parse(csv);
ck("6 rows parsed", rows.length===6, rows.length);
const res=A.audit(rows);
ck("finds 2 leaking rows", res.leakCount===2, res.leakCount);
ck("1 exact duplicate", res.exactCount===1, res.exactCount);
const re=A.audit(res.corrected.map(r=>({id:r.id,seq:r.seq,split:r.corrected})));
ck("CORRECTED SPLIT IS CLEAN", re.leakCount===0, re.leakCount);
ck("report mentions the file", A.reportMarkdown(res,{name:"x.csv"}).includes("x.csv"));
console.log("\n"+pass+" passed, "+fail+" failed");
process.exit(fail?1:0);
