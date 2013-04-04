import os
import sys
from subprocess import Popen, PIPE
import pyinotify
import webbrowser

try:
    db = sys.argv[1]
except:
    print "No DB specified"
    exit()
    

def push(db):
	output, error = Popen(["couchapp", "push", db], stdout=None, stderr=PIPE).communicate()


mask = (pyinotify.IN_MODIFY | pyinotify.IN_CREATE | pyinotify.IN_DELETE)
	   
curdir = "./"
# find root dir
while (".couchapprc" not in os.listdir(curdir)) :
    curdir = os.path.normpath("../" + curdir)

curdir = os.path.abspath(curdir)


class MyEventHandler(pyinotify.ProcessEvent):

    def process_IN_CLOSE_WRITE(self, event):
        if not exclude(event.name): push(db)

    def process_IN_CREATE(self, event):
        if not exclude(event.name): push(db)

    def process_IN_DELETE(self, event):
        if not exclude(event.name): push(db)

    def process_IN_MODIFY(self, event):
        if not exclude(event.name): push(db)



def exclude(fn):
    if "~" in fn or ".svn" in fn or ".#" in fn:
        return True
    return False

try:
    push(db)

    # watch manager
    wm = pyinotify.WatchManager()
    wm.add_watch(curdir, mask, rec=True, exclude_filter=exclude)
    
    # event handler
    eh = MyEventHandler()
    
    # notifier
    notifier = pyinotify.Notifier(wm, eh)
    
    notifier.loop()
    
finally:
    pass
