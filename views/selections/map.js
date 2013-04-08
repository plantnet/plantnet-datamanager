function (doc) {
    // return selection docs    
    if (doc.$type === "selection") {
	emit(doc.name, {/*id: doc._id,*/ 
                        name: doc.name, 
                        length: doc.ids.length
                       });
    }
}