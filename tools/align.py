import json, sys
from pocketsphinx import Decoder, Config
dec = Decoder(samprate=16000, lm=None)
for w,p in [("bandung","B AA N D UH NG"),("kalijati","K AA L IY JH AA T IY"),("aceh","AA CH EH")]:
    dec.add_word(w,p,update=True)
text=" ".join(open(sys.argv[2]).read().split())
dec.set_align_text(text)
raw=open(sys.argv[1],'rb').read()
dec.start_utt(); dec.process_raw(raw, full_utt=True); dec.end_utt()
fr=dec.config['frate']
out=[]
for s in dec.seg():
    if s.word in ('<s>','</s>','<sil>','[NOISE]') : continue
    out.append({"w":s.word.split('(')[0],"s":round(s.start_frame/fr,3),"e":round((s.end_frame+1)/fr,3)})
json.dump(out,open(sys.argv[3],'w'))
print(len(out), len(text.split()))
print(" ".join(f"{x['w']}[{x['s']:.2f}]" for x in out))
