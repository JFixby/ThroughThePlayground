import os
import json
import PIL
from psd_tools import PSDImage

data = {}
scale = 1.0
psd_name = 'playground.psd'
folder_name = ''

def save(layer, z):
    global folder_name

    name = layer.name.replace(" ", "_")
    print name + '_png : \"res/' + folder_name + '/' + name + '.png\",'

    image = layer.as_PIL()
    image = image.resize((int(image.size[0]*scale), int(image.size[1]*scale)), PIL.Image.ANTIALIAS)
    name_png = '../res/' + folder_name + '/' + name + '.png'
    try:
        image.save(name_png)
    except:
        print 'failed to save image'

    props = dict()
    props['name'] = name
    props['file'] = 'res/' + folder_name + '/' + name + '.png'
    props['x'] = scale*0.5*(layer.bbox.x1 + layer.bbox.x2)
    props['y'] = scale*0.5*(layer.bbox.y1 + layer.bbox.y2)
    props['z'] = z

    data[layer.name] = props


folder_name = psd_name.split('.')[0]

folder_path = os.path.join('..', 'res', folder_name)
if not os.path.exists(folder_path):
    os.makedirs(folder_path)

psd = PSDImage.load(psd_name)

z = 0
for group in psd.layers:
    try:
        for obj in group.layers:
            save(obj, z)
    except:
        save(group, z)

    z -= 1

print data
with open('../res/playground.json', 'w') as out:
    json.dump(data, out, indent=4, sort_keys=True)

# TODO:
# import io, json
# with io.open('data.txt', 'w', encoding='utf-8') as f:
#   f.write(unicode(json.dumps(data, ensure_ascii=False)))