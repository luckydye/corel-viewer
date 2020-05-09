import { BinaryFile } from '../../node_modules/@uncut/binary-file-lib/files/BinaryFile.js';

// Corel Draw X6 file format
// https://github.com/photopea/CDR-specification

export default class CDRFile extends BinaryFile {

    static async fromDataArray(arrayBuffer, filename) {
        const cdr = new CDRFile();

        cdr.filename = filename;

        return new Promise((resolve, reject) => {
            const blob = new Blob([ arrayBuffer ]);
    
            zip.createReader(new zip.BlobReader(blob), reader => {

                reader.getEntries(entries => {
                    for(let entry of entries) {
                        switch(entry.filename) {
                            case 'metadata/thumbnails/thumbnail.bmp':
                                const img = new Image();
    
                                entry.getData(new zip.BlobWriter("image/bmp"), function(data) {
                                    const url = URL.createObjectURL(data);
                                    img.src = url;
                                    img.setAttribute('tag', entry.filename);
                                    reader.close();
                                });
    
                                cdr.thumbnail = img;
                                break;
                        }
                    }
                    
                    resolve(cdr);
                });
            }, err => {
                reject(err);
            });
        })
    }

}
