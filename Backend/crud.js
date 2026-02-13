const fs = require('fs');
fs.writeFile('data.txt','hello',(err)=>{
if(err){
    console.log('Error writing file:',err);
}else{
    console.log('File created and written.')
    fs.readFile('data.txt','utf8',(err,data)=>{
        if(err){
            console.log('Error reading file:',err);
        }else{
            console.log('File Content:',data);
            fs.appendFile('data.txt','\nUpdated',(err)=>{
                if(err){
                    console.log('Error updating file:',err);
                }else{
                    console.log('File Updated.');
                    fs.unlink('data.txt',(err)=>{
                        if(err){
                            console.log('Error deleting file:',err);
                        }else{
                            console.log('File Deleted.');
                        }
                    })
                }
            })
        }
    })
}
})