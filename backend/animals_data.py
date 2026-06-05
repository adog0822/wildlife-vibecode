"""LoxeLife Animal Database - 200+ animals across 8 biomes.

Each animal: id (slug), name, rarity 1-5, region (biome key), subregion,
wiki (Wikipedia page title for image fetch), stats and superpower, facts.

Stats are 1-10:
- diet (1=plant, 10=apex carnivore)
- stealth (elusiveness)
- impact (ecosystem keystone-ness)
- invasive (how dangerous if introduced)
- survivability (50-yr survival outlook)
"""

# Region keys map to design biomes:
# savanna, canopy, dunes, peaks, woods, outback, wastes, ocean

def _A(id, name, rarity, region, sub, wiki, diet, stealth, impact, invasive, survival, power, facts):
    return {
        "id": id, "name": name, "rarity": rarity, "region": region, "subregion": sub,
        "wiki": wiki, "diet": diet, "stealth": stealth, "impact": impact,
        "invasive": invasive, "survivability": survival, "superpower": power,
        "facts": facts,
    }

ANIMALS = [
    # === AFRICA — SAVANNA (region: savanna) ===
    _A("african-bush-elephant","African Bush Elephant",3,"savanna","Savanna","African bush elephant",1,3,10,2,4,"Seismic Stomp",["Lives in matriarchal herds","Largest land animal on Earth","Communicates via low-frequency rumbles"]),
    _A("lion","Lion",3,"savanna","Savanna","Lion",10,5,9,3,5,"Pride Roar",["Lives in a pride","Only big cat that lives in social groups","Females do most of the hunting"]),
    _A("cheetah","Cheetah",3,"savanna","Savanna","Cheetah",9,6,6,2,4,"Sprint Burst (75 mph)",["Fastest land animal","Cannot retract its claws","Uses tail as a rudder when turning"]),
    _A("plains-zebra","Plains Zebra",1,"savanna","Savanna","Plains zebra",1,3,5,2,6,"Pattern Dazzle",["Every zebra has a unique stripe pattern","Migrates across the Serengeti","Stripes confuse biting flies"]),
    _A("masai-giraffe","Masai Giraffe",2,"savanna","Savanna","Masai giraffe",1,2,6,1,5,"Skyline Reach",["Tallest land animal","Has a 45cm prehensile tongue","Heart weighs 11 kg"]),
    _A("hippopotamus","Hippopotamus",2,"savanna","Rivers","Hippopotamus",2,4,7,3,5,"Crushing Jaws",["Most aggressive mammal in Africa","Secretes natural sunscreen","Can hold breath for 5 minutes"]),
    _A("cape-buffalo","Cape Buffalo",1,"savanna","Savanna","African buffalo",1,3,7,2,6,"Mob Charge",["Travels in herds of 1000+","Known as Black Death by hunters","Never fully domesticated"]),
    _A("white-rhinoceros","White Rhinoceros",4,"savanna","Savanna","White rhinoceros",1,3,8,1,3,"Armored Charge",["Second largest land mammal","Name comes from Dutch 'wijd' (wide)","Recovered from near extinction"]),
    _A("black-rhinoceros","Black Rhinoceros",5,"savanna","Savanna","Black rhinoceros",1,4,8,1,2,"Hooked Lip Browser",["Critically endangered","Has a prehensile upper lip","Two horns of keratin"]),
    _A("leopard","Leopard",3,"savanna","Savanna","Leopard",10,8,7,3,5,"Tree Drag",["Hauls prey up into trees","Most adaptable big cat","Solitary hunters"]),
    _A("spotted-hyena","Spotted Hyena",1,"savanna","Savanna","Spotted hyena",9,5,7,4,7,"Bone Crusher",["Matriarchal society","Stronger bite than a lion","Can digest bones and hooves"]),
    _A("african-wild-dog","African Wild Dog",4,"savanna","Savanna","African wild dog",9,6,7,2,3,"Pack Endurance Hunt",["Most successful predator by kill rate","Each has unique fur pattern","Hunts via vote (sneeze ritual)"]),
    _A("wildebeest","Wildebeest",1,"savanna","Savanna","Wildebeest",1,2,7,2,7,"Stampede",["Migration of 1.5 million animals annually","Newborns run within minutes","Known as gnu"]),
    _A("meerkat","Meerkat",1,"savanna","Savanna","Meerkat",6,3,4,2,7,"Sentry Watch",["Lives in mobs of up to 50","Takes turns standing guard","Immune to scorpion venom"]),
    _A("ostrich","Ostrich",1,"savanna","Savanna","Common ostrich",4,3,4,2,7,"Power Kick",["Largest living bird","Cannot fly but runs at 70 km/h","Lays the largest egg of any bird"]),
    _A("warthog","Warthog",1,"savanna","Savanna","Common warthog",4,3,4,2,7,"Tusk Charge",["Kneels on padded knees to graze","Backs into burrows tusk-first","Famous for Pumbaa"]),
    _A("secretary-bird","Secretary Bird",2,"savanna","Savanna","Secretary bird",8,3,5,1,4,"Stomp Strike",["Kills snakes by stomping","Walks 20+ km a day hunting","Long quill feathers behind head"]),
    _A("pangolin","Pangolin",5,"savanna","Forest","Pangolin",3,9,6,1,1,"Scale Armor Roll",["Most trafficked mammal","Only mammal with scales","Curls into impenetrable ball"]),
    _A("honey-badger","Honey Badger",2,"savanna","Savanna","Honey badger",8,4,5,2,7,"Venom Immunity",["Fearless toward predators","Immune to cobra venom","Skin so thick spines bounce off"]),
    # === SAHARA / DUNES ===
    _A("fennec-fox","Fennec Fox",3,"dunes","Sahara","Fennec fox",7,6,4,2,6,"Heat-Dispersing Ears",["Smallest fox in the world","Ears are 6 inches long","Doesn't need to drink water"]),
    _A("dromedary-camel","Dromedary Camel",1,"dunes","Sahara","Dromedary",1,2,5,2,8,"Hump Reservoir",["Can drink 30 gallons in 13 minutes","Hump stores fat, not water","Three eyelids to block sand"]),
    _A("addax","Addax",5,"dunes","Sahara","Addax",1,5,6,1,1,"Heat-Reflective Coat",["Critically endangered","White coat in summer, brown in winter","Can survive without drinking water"]),
    _A("saharan-horned-viper","Saharan Horned Viper",3,"dunes","Sahara","Cerastes cerastes",9,8,5,3,5,"Sidewinding Strike",["Buries itself in sand to ambush","Horns above eyes","Sidewinds across dunes"]),
    _A("deathstalker-scorpion","Deathstalker Scorpion",2,"dunes","Sahara","Deathstalker",8,7,4,4,7,"Neurotoxic Sting",["One of the deadliest scorpions","Venom used in cancer research","Glows under UV light"]),
    _A("sand-cat","Sand Cat",4,"dunes","Sahara","Sand cat",8,9,4,1,4,"Silent Paw-Pad",["Furred paws muffle steps in sand","Can survive temperatures of 50°C","Hardly ever drinks water"]),
    _A("dorcas-gazelle","Dorcas Gazelle",2,"dunes","Sahara","Dorcas gazelle",1,5,5,2,5,"Heat Endurance Run",["Survives without drinking","White rump warns the herd","Can leap 2m high"]),
    _A("arabian-oryx","Arabian Oryx",4,"dunes","Arabia","Arabian oryx",1,4,5,1,4,"Mirage Sentinel",["Once extinct in wild, now restored","Long straight horns inspired unicorn myth","Detects rain from 70 km away"]),
    _A("arabian-leopard","Arabian Leopard",5,"dunes","Arabia","Arabian leopard",10,9,7,1,1,"Cliff-Side Ambush",["Critically endangered, <200 left","Smallest leopard subspecies","Hunts in rocky wadis"]),
    _A("sand-gazelle","Sand Gazelle",3,"dunes","Arabia","Sand gazelle",1,5,4,1,4,"Dune Glide",["Also called the Reem","Pale coat reflects sun","Endemic to Arabian peninsula"]),
    _A("caracal","Caracal",2,"dunes","Arabia","Caracal",9,7,5,2,6,"Aerial Leap",["Leaps 3m to snatch birds mid-air","Tufted black ears","Solitary hunter"]),
    _A("indian-crested-porcupine","Indian Crested Porcupine",1,"dunes","Arabia","Indian crested porcupine",2,5,4,2,8,"Quill Volley",["Can have 30cm quills","Rattles quills as warning","Largest rodent in the Middle East"]),
    _A("egyptian-vulture","Egyptian Vulture",3,"dunes","Arabia","Egyptian vulture",6,3,5,1,3,"Tool-Using Beak",["Uses stones to crack eggs","Sacred in ancient Egypt","One of few tool-using birds"]),

    # === CONGO / SE ASIA / AMAZON RAINFOREST → canopy ===
    _A("western-lowland-gorilla","Western Lowland Gorilla",5,"canopy","Congo","Western lowland gorilla",2,5,8,1,2,"Knuckle-Walk Might",["Largest living primate","Shares 98% of human DNA","Lives in troops led by a silverback"]),
    _A("chimpanzee","Chimpanzee",3,"canopy","Congo","Chimpanzee",6,5,8,1,4,"Tool Crafter",["Uses tools (sticks, rocks)","Closest living relative of humans","Lives in fission-fusion societies"]),
    _A("okapi","Okapi",4,"canopy","Congo","Okapi",1,8,5,1,2,"Forest Ghost Stride",["Closest living relative of the giraffe","Striped legs like a zebra","Solitary and elusive"]),
    _A("mandrill","Mandrill",3,"canopy","Congo","Mandrill",6,4,5,1,4,"Vibrant Display",["Most colorful mammal","Largest monkey species","Lives in hordes up to 800 strong"]),
    _A("bongo","Bongo",4,"canopy","Congo","Bongo (antelope)",1,7,5,1,3,"Stripe Camouflage",["Largest forest antelope","Both sexes have spiral horns","Active at twilight"]),
    _A("congo-peafowl","Congo Peafowl",4,"canopy","Congo","Congo peafowl",4,7,4,1,2,"Rainforest Plumage",["Only true peafowl native to Africa","Discovered scientifically in 1936","National bird of DR Congo"]),
    _A("african-forest-elephant","African Forest Elephant",5,"canopy","Congo","African forest elephant",1,5,9,1,1,"Path-Cutter",["Smaller than its savanna cousin","Tusks point downward","Critically endangered"]),
    _A("gaboon-viper","Gaboon Viper",2,"canopy","Congo","Gaboon viper",10,9,5,3,5,"Longest Fangs (5cm)",["Has the longest fangs of any snake","Heaviest venomous snake in Africa","Leaf-litter camouflage"]),
    _A("goliath-beetle","Goliath Beetle",2,"canopy","Congo","Goliath beetle",2,5,3,2,6,"Lift Power (850x bodyweight)",["One of the largest insects","Larvae prefer rotting wood","Can fly despite massive size"]),
    _A("bengal-tiger","Bengal Tiger",4,"canopy","SE Asia","Bengal tiger",10,7,9,2,3,"Stripe Stalk",["No two tigers share the same stripes","Largest cat species","Can leap 9m in one bound"]),
    _A("malayan-tapir","Malayan Tapir",4,"canopy","SE Asia","Malayan tapir",1,7,5,1,2,"Snorkel Snout",["Black-and-white camouflage in dappled light","Closest living relative is the rhino","Newborns have stripes like watermelons"]),
    _A("orangutan","Orangutan",5,"canopy","SE Asia","Orangutan",3,5,8,1,2,"Canopy Architect",["Shares 97% of human DNA","Builds new nest every night","Name means person of the forest"]),
    _A("asian-elephant","Asian Elephant",4,"canopy","SE Asia","Asian elephant",1,3,9,1,3,"Trunk Dexterity",["Smaller ears than African elephants","Used as work animals for millennia","Endangered status"]),
    _A("komodo-dragon","Komodo Dragon",3,"canopy","SE Asia","Komodo dragon",10,5,6,3,4,"Venomous Bite",["Largest living lizard","Saliva contains venom","Can detect prey 4 km away"]),
    _A("king-cobra","King Cobra",2,"canopy","SE Asia","King cobra",10,6,6,3,5,"Hooded Strike",["Longest venomous snake","Only snake that builds a nest","Can stand 1/3 of body height upright"]),
    _A("proboscis-monkey","Proboscis Monkey",3,"canopy","SE Asia","Proboscis monkey",2,5,4,1,3,"Mega-Nose Resonance",["Massive nose amplifies calls","Pot-bellied digestive system","Only in Borneo's mangroves"]),
    _A("sun-bear","Sun Bear",4,"canopy","SE Asia","Sun bear",6,6,5,1,3,"Climbing Claws",["Smallest bear species","Has a golden chest patch","Tongue can be 25cm long"]),
    _A("clouded-leopard","Clouded Leopard",4,"canopy","SE Asia","Clouded leopard",10,9,6,1,3,"Inverted Tree Descent",["Can climb down trees head-first","Longest canine teeth relative to size","Cloud-shaped coat markings"]),
    _A("slow-loris","Slow Loris",4,"canopy","SE Asia","Slow loris",6,9,4,1,2,"Toxic Bite",["Only venomous primate","Toxin produced from elbow gland","Big eyes for nocturnal life"]),
    _A("philippine-eagle","Philippine Eagle",5,"canopy","SE Asia","Philippine eagle",10,7,7,1,1,"Apex Talons",["National bird of Philippines","Critically endangered","Mates for life"]),
    _A("binturong","Binturong",3,"canopy","SE Asia","Binturong",6,7,4,1,3,"Popcorn Scent",["Smells like buttered popcorn","Prehensile tail","Also called bearcat"]),
    _A("gharial","Gharial",5,"canopy","SE Asia","Gharial",10,5,6,1,1,"Snare-Snout",["Long thin snout full of teeth","Eats almost exclusively fish","Critically endangered"]),
    _A("saola","Saola",5,"canopy","SE Asia","Saola",1,10,7,1,1,"Asian Unicorn",["So rare it is called the Asian Unicorn","Discovered only in 1992","Your guide on this journey"]),
    _A("jaguar","Jaguar",3,"canopy","Amazon","Jaguar",10,8,9,2,4,"Skull-Piercing Bite",["Strongest bite of any big cat","Pierces turtle shells and skulls","Only big cat in the Americas"]),
    _A("sloth-brown","Brown-throated Sloth",1,"canopy","Amazon","Brown-throated sloth",2,7,3,1,5,"Algae Camouflage",["Algae grows in its fur","Moves so slow algae camouflages it","Only descends once a week"]),
    _A("capybara","Capybara",1,"canopy","Amazon","Capybara",1,3,5,2,8,"Universal Friend",["Largest rodent in the world","Gets along with every animal","Semi-aquatic"]),
    _A("giant-anteater","Giant Anteater",3,"canopy","Amazon","Giant anteater",4,5,5,1,4,"Tongue Lash (60cm)",["Tongue extends 60cm","Eats 30,000 ants per day","No teeth"]),
    _A("poison-dart-frog","Poison Dart Frog",2,"canopy","Amazon","Poison dart frog",4,3,4,2,5,"Skin Toxin",["Bright colors warn predators","Used to poison blow-darts","Toxicity from diet of ants"]),
    _A("toucan","Toucan",1,"canopy","Amazon","Toucan",4,3,4,2,7,"Beak-Reach Forage",["Massive but lightweight beak","Beak helps regulate temperature","Lives in cavities of trees"]),
    _A("scarlet-macaw","Scarlet Macaw",2,"canopy","Amazon","Scarlet macaw",4,4,4,1,5,"Clay-Lick Detox",["Can live 80+ years","Eats clay to neutralize toxins","Mated pairs for life"]),
    _A("anaconda","Green Anaconda",2,"canopy","Amazon","Green anaconda",10,7,7,2,5,"Constriction Crush",["Heaviest snake in the world","Gives birth to live young","Females are 4x larger than males"]),
    _A("harpy-eagle","Harpy Eagle",4,"canopy","Amazon","Harpy eagle",10,7,7,1,2,"Sloth Snatcher Talons",["Talons larger than a grizzly bear's","Most powerful raptor","Hunts sloths and monkeys"]),
    _A("pink-river-dolphin","Pink River Dolphin",4,"canopy","Amazon","Amazon river dolphin",9,6,6,1,2,"Sonar in Flooded Forest",["Pink color from broken capillaries","Largest river dolphin","Featured in Amazon legends"]),
    _A("black-caiman","Black Caiman",2,"canopy","Amazon","Black caiman",10,7,7,2,5,"Night-Vision Ambush",["Largest predator in the Amazon","Can grow to 5m long","Recovering from heavy hunting"]),
    _A("ocelot","Ocelot",2,"canopy","Amazon","Ocelot",10,8,5,1,5,"Nocturnal Stalker",["Sleeps in trees during day","Often kept as pets by Salvador Dalí","Excellent swimmers"]),
    _A("emperor-tamarin","Emperor Tamarin",3,"canopy","Amazon","Emperor tamarin",4,5,4,1,4,"Royal Whiskers",["Named for resemblance to Kaiser Wilhelm","Twin births are common","Lives in groups of 2-8"]),
    _A("goliath-birdeater","Goliath Birdeater",2,"canopy","Amazon","Goliath birdeater",9,7,3,2,5,"Urticating Hair Volley",["Largest spider in the world","Flicks hairs at attackers","Rarely actually eats birds"]),
    _A("emerald-tree-boa","Emerald Tree Boa",2,"canopy","Amazon","Emerald tree boa",10,8,4,2,5,"Suspended Strike",["Drapes itself on tree branches","Long teeth for grabbing birds","Born red, turns green"]),
    _A("hoatzin","Hoatzin",2,"canopy","Amazon","Hoatzin",2,3,3,1,5,"Stinkbird Fermentation",["Smells like manure due to fermentation","Chicks have claws on wings","Sometimes called Stinkbird"]),
    _A("baird-tapir","Baird's Tapir",4,"canopy","C. America","Baird's tapir",1,7,5,1,2,"Snout-Snorkel",["Largest land mammal in Central America","Named after naturalist Spencer Baird","Endangered"]),
    _A("quetzal","Resplendent Quetzal",4,"canopy","C. America","Resplendent quetzal",4,5,4,1,3,"Tail Streamer",["National bird of Guatemala","Sacred to Aztec and Maya","Males grow 1m tail feathers"]),
    _A("howler-monkey","Howler Monkey",2,"canopy","C. America","Howler monkey",2,4,5,1,6,"Megaphone Roar",["Loudest land animal","Call carries 5 km","Prehensile tail"]),
    _A("keel-billed-toucan","Keel-billed Toucan",2,"canopy","C. America","Keel-billed toucan",4,4,4,1,6,"Rainbow Beak",["National bird of Belize","Beak is lightweight bone","Tosses fruit before eating"]),
    _A("red-eyed-tree-frog","Red-eyed Tree Frog",1,"canopy","C. America","Red-eyed tree frog",4,4,3,1,6,"Startle Flash",["Flashes red eyes to startle predators","Sticky toe pads","Sleeps with eyes closed"]),
    _A("margay","Margay",4,"canopy","C. America","Margay",10,9,5,1,3,"360° Ankle Rotation",["Can rotate ankles 180°","Climbs head-down like a squirrel","Mimics monkey calls to lure prey"]),
    _A("kinkajou","Kinkajou",2,"canopy","C. America","Kinkajou",4,6,4,1,5,"Tongue-Lap Pollination",["Sometimes called honey bear","Prehensile tail","Active only at night"]),
    _A("vampire-bat","Vampire Bat",1,"canopy","C. America","Common vampire bat",8,7,5,2,7,"Heat-Pit Blood Sense",["Drinks blood through saliva anticoagulant","Shares meals with hungry roost-mates","Can run on the ground"]),
    _A("american-crocodile","American Crocodile",3,"canopy","C. America","American crocodile",10,6,6,2,4,"Saltwater Adapt",["Tolerates saltwater","Mother carries hatchlings in jaw","Coexists with people in Florida"]),
    _A("axolotl","Axolotl",5,"canopy","Mexico","Axolotl",4,4,5,1,1,"Limb Regeneration",["Can regrow entire limbs","Stays in larval form forever","Critically endangered in wild"]),
    _A("monarch-butterfly","Monarch Butterfly",2,"canopy","Americas","Monarch butterfly",2,2,5,1,3,"Multi-Generation Migration",["Migrates 4,800 km","Toxic to predators","Migration uses 4 generations"]),

    # === HIMALAYAS / ANDES → peaks ===
    _A("snow-leopard","Snow Leopard",5,"peaks","Himalaya","Snow leopard",10,10,7,1,2,"Mountain Phantom",["Ghost of the mountains","Tail can be as long as its body","Cannot roar"]),
    _A("red-panda","Red Panda",4,"peaks","Himalaya","Red panda",2,7,4,1,2,"Tail Blanket",["Sometimes called firefox","Wraps tail around itself in cold","Not related to giant pandas"]),
    _A("himalayan-tahr","Himalayan Tahr",2,"peaks","Himalaya","Himalayan tahr",1,5,4,2,4,"Cliff Grip",["Lives at 4500m altitude","Thick reddish coat in winter","Both sexes have horns"]),
    _A("tibetan-macaque","Tibetan Macaque",2,"peaks","Himalaya","Tibetan macaque",4,3,4,2,5,"Snowy Sit-In",["Largest macaque species","Lives at high altitude","Lives in matriarchal troops"]),
    _A("himalayan-monal","Himalayan Monal",2,"peaks","Himalaya","Himalayan monal",4,4,4,1,5,"Iridescent Dance",["National bird of Nepal","Males have 9 colored feathers","Digs for tubers in snow"]),
    _A("pallas-cat","Pallas's Cat",4,"peaks","Himalaya","Pallas's cat",9,9,5,1,3,"Grumpy Stare",["Looks permanently grumpy","Thickest fur of any cat","Internet-famous"]),
    _A("yak","Domestic Yak",1,"peaks","Himalaya","Domestic yak",1,2,5,2,8,"Altitude Endurance",["Used as pack animal","Has 3x more red blood cells than cattle","Thick fur survives -40°C"]),
    _A("markhor","Markhor",4,"peaks","Himalaya","Markhor",1,6,5,1,3,"Spiral Horn Charge",["National animal of Pakistan","Has spiraling horns","Eats snakes (legend)"]),
    _A("andean-condor","Andean Condor",3,"peaks","Andes","Andean condor",6,4,6,1,4,"3m Wingspan Glide",["Largest flying bird","Wingspan up to 3.3m","National symbol of multiple Andean nations"]),
    _A("llama","Llama",1,"peaks","Andes","Llama",1,2,4,2,9,"Spit Defense",["Used as pack animal","Spits when annoyed","Domesticated 4000 years ago"]),
    _A("alpaca","Alpaca",1,"peaks","Andes","Alpaca",1,2,4,2,9,"Wool Insulation",["Smaller than llamas","Bred for fine wool","Lives in herds"]),
    _A("vicuna","Vicuña",3,"peaks","Andes","Vicuña",1,5,4,1,4,"Royal Wool",["Wool finer than cashmere","National animal of Peru","Ancestor of alpaca"]),
    _A("spectacled-bear","Spectacled Bear",3,"peaks","Andes","Spectacled bear",5,7,5,1,3,"Paddington's Climb",["Only bear in South America","Inspired Paddington Bear","Builds platforms in trees"]),
    _A("mountain-tapir","Mountain Tapir",4,"peaks","Andes","Mountain tapir",1,7,5,1,2,"Cloud-Forest Roam",["Smallest tapir species","Wooly black fur","Endangered"]),
    _A("chinchilla","Chinchilla",5,"peaks","Andes","Chinchilla",1,7,3,1,1,"Densest Fur (20,000 hairs/cm²)",["Densest fur of any mammal","Hunted to near extinction for fur","Dust baths only"]),
    _A("puma","Puma",2,"peaks","Andes","Cougar",10,8,7,2,5,"Standing Leap (5.5m)",["Most names of any animal","Cannot roar, only purrs","Highest vertical leap of any cat"]),

    # === PATAGONIA + N.AM. FORESTS → woods ===
    _A("guanaco","Guanaco",1,"woods","Patagonia","Guanaco",1,3,5,2,7,"High Altitude Burst",["Ancestor of the llama","Lives in mixed-sex herds","Can run 64 km/h"]),
    _A("darwin-rhea","Darwin's Rhea",2,"woods","Patagonia","Darwin's rhea",2,4,4,2,5,"Steppe Sprint",["Cannot fly","Lays huge greenish eggs","Males incubate the eggs"]),
    _A("patagonian-mara","Patagonian Mara",3,"woods","Patagonia","Patagonian mara",1,4,4,2,5,"Hare-Hop Sprint",["Looks like a rabbit-deer mix","Monogamous pairs","Diurnal rodent"]),
    _A("maned-wolf","Maned Wolf",4,"woods","Patagonia","Maned wolf",6,7,5,1,3,"Stilt-Leg Stride",["Tallest wild canid","Looks like a fox on stilts","Urine smells like cannabis"]),
    _A("pampas-cat","Pampas Cat",4,"woods","Patagonia","Pampas cat",9,9,5,1,3,"Grass Stalker",["Small wildcat of the pampas","Coat varies wildly by region","Rarely seen"]),
    _A("galapagos-tortoise","Galapagos Giant Tortoise",4,"ocean","Galapagos","Galápagos tortoise",1,3,5,1,3,"Century Lifespan",["Can live 150+ years","Inspired Darwin's theory","Each island has unique subspecies"]),
    _A("marine-iguana","Marine Iguana",3,"ocean","Galapagos","Marine iguana",2,5,5,1,4,"Seaweed Diver",["Only sea-going lizard","Sneezes out salt","Endemic to Galapagos"]),
    _A("blue-footed-booby","Blue-footed Booby",2,"ocean","Galapagos","Blue-footed booby",6,3,4,1,6,"Dance of the Feet",["Males do mating dance with feet","Bluer feet = healthier","Plunge-dives from 24m"]),
    _A("flightless-cormorant","Flightless Cormorant",4,"ocean","Galapagos","Flightless cormorant",8,3,4,1,2,"Wing Loss Evolution",["Only flightless cormorant","Wings 1/3 normal size","Endemic to two islands"]),
    _A("southern-right-whale","Southern Right Whale",3,"ocean","Patagonia","Southern right whale",3,3,6,1,5,"Callosity Identity",["Identified by callosities","Slow swimmer made it 'right' to hunt","Now protected"]),
    _A("magellanic-penguin","Magellanic Penguin",2,"ocean","Patagonia","Magellanic penguin",6,3,5,1,5,"Burrow Nester",["Nests in burrows","Migrates 2000 km annually","Mates for life"]),
    # N America forests
    _A("grizzly-bear","Grizzly Bear",2,"woods","N. America","Grizzly bear",7,4,8,1,5,"Salmon Snatch",["Eats up to 40kg salmon a day","Can smell food 30 km away","Hibernates 5-7 months"]),
    _A("black-bear","Black Bear",1,"woods","N. America","American black bear",6,5,6,2,8,"Tree Climb",["Can climb trees as adults","Most numerous bear in N. America","Hibernates in dens"]),
    _A("gray-wolf","Gray Wolf",2,"woods","N. America","Gray wolf",10,6,9,1,6,"Pack Hunt Coordination",["Apex predator in many ecosystems","Reintroduction reshaped Yellowstone","Howls heard 10 km away"]),
    _A("moose","Moose",1,"woods","N. America","Moose",1,3,6,2,7,"Antler Wrecking Ball",["Largest deer species","Antlers can span 2m","Excellent swimmers"]),
    _A("elk","Elk",1,"woods","N. America","Elk",1,3,5,2,7,"Bugle Call",["Males bugle in autumn","Antlers shed yearly","Lives in large herds"]),
    _A("mountain-lion","Mountain Lion / Cougar",2,"woods","N. America","Cougar",10,8,7,2,5,"Stealth Pounce",["Many names: puma, panther, cougar","Largest cat that purrs","Highest leap of any cat (5.5m)"]),
    _A("bald-eagle","Bald Eagle",1,"woods","N. America","Bald eagle",9,4,5,1,7,"Talon Snatch Dive",["U.S. national bird","Eyes 4x sharper than humans","Builds largest tree nest"]),
    _A("wolverine","Wolverine",3,"woods","N. America","Wolverine",8,7,5,1,4,"Bone-Crusher Jaws",["Largest land mustelid","Travels 30 km a day","Frost-resistant fur"]),
    _A("raccoon","Raccoon",1,"woods","N. America","Raccoon",6,5,4,4,9,"Lockpick Paws",["Has incredibly dexterous paws","Washes food in water","Highly adaptable urban species"]),
    _A("striped-skunk","Striped Skunk",1,"woods","N. America","Striped skunk",5,4,3,2,8,"Spray Bomb",["Spray smells 1.5 km away","Can aim spray 3m accurately","Mostly nocturnal"]),
    _A("beaver","North American Beaver",1,"woods","N. America","North American beaver",1,3,9,3,8,"Dam Engineer",["Keystone species","Builds dams up to 850m long","Teeth orange from iron"]),
    _A("north-american-porcupine","North American Porcupine",1,"woods","N. America","North American porcupine",1,4,3,1,8,"Quill Defense",["Has 30,000 quills","Quills have barbed tips","Climbs trees slowly"]),
    _A("bobcat","Bobcat",1,"woods","N. America","Bobcat",10,7,5,2,7,"Brush Ambush",["Most common wildcat in N. America","Short bobbed tail","Tufted ears"]),
    _A("snowy-owl","Snowy Owl",2,"woods","N. America","Snowy owl",8,7,5,1,5,"Silent Snowflight",["Hedwig of Harry Potter","Hunts day and night","Migrates south some winters"]),
    # N America deserts (still woods? — categorize as dunes)
    _A("gila-monster","Gila Monster",3,"dunes","N. America","Gila monster",8,5,4,1,5,"Venomous Grip-Bite",["Only venomous lizard in U.S.","Holds bite to deliver venom","Spends 95% of time underground"]),
    _A("coyote","Coyote",1,"dunes","N. America","Coyote",8,5,5,3,9,"Trickster Cunning",["Highly adaptable to cities","Often featured in Native folklore","Yips and howls communicate"]),
    _A("roadrunner","Greater Roadrunner",1,"dunes","N. America","Greater roadrunner",7,4,4,1,7,"32 km/h Sprint",["Beep beep!","Can run 32 km/h","Kills rattlesnakes"]),
    _A("rattlesnake","Western Diamondback Rattlesnake",1,"dunes","N. America","Western diamondback rattlesnake",10,7,5,2,7,"Rattle Warning",["Rattles tail to warn","Pit organs sense heat","Venom potent but warning given"]),
    _A("desert-tortoise","Desert Tortoise",3,"dunes","N. America","Desert tortoise",1,4,4,1,4,"Subterranean Refuge",["Spends 95% of life underground","Can live 50+ years","Stores water in bladder"]),
    _A("nine-banded-armadillo","Nine-banded Armadillo",1,"dunes","N. America","Nine-banded armadillo",4,4,3,2,8,"Roly-Poly Armor",["Always gives birth to identical quadruplets","Can hold breath 6 minutes","Expanding range northward"]),
    _A("pronghorn","Pronghorn",2,"dunes","N. America","Pronghorn",1,4,5,1,6,"Speed Endurance (88 km/h)",["Fastest land animal in Americas","Evolved alongside extinct cheetahs","Can spot movement 6 km away"]),
    _A("bighorn-sheep","Bighorn Sheep",2,"woods","N. America","Bighorn sheep",1,4,5,1,6,"Skull Slam",["Horns can weigh 14 kg","Head-butting battles heard 1 km","Climbs sheer cliffs"]),
    _A("turkey-vulture","Turkey Vulture",1,"woods","N. America","Turkey vulture",5,3,5,1,8,"Scent of Death",["Smells carrion from kilometers away","Eats pathogens harmlessly","Pees on its own legs to cool"]),

    # === EUROPE → woods ===
    _A("brown-bear","Brown Bear",2,"woods","Europe","Brown bear",7,4,7,1,6,"Forest Lord",["Includes grizzlies as a subspecies","Hibernates 4-6 months","National animal of Finland"]),
    _A("eurasian-wolf","Eurasian Wolf",2,"woods","Europe","Eurasian wolf",10,6,8,1,6,"Howling Pack",["Returned to many parts of Europe","Pack of 5-11 wolves","Inspired werewolf legends"]),
    _A("red-fox","Red Fox",1,"woods","Europe","Red fox",7,5,5,4,9,"Sly Pounce",["Most widespread wild carnivore","Magnetic-field-aided pounce","Adapts to cities"]),
    _A("eurasian-wild-boar","Eurasian Wild Boar",1,"woods","Europe","Wild boar",4,4,6,4,8,"Tusker Charge",["Ancestor of domestic pig","Tusks grow throughout life","Invasive in many lands"]),
    _A("red-deer","Red Deer",1,"woods","Europe","Red deer",1,3,5,2,8,"Rutting Roar",["Largest deer in Europe","Males roar during rut","Antlers shed annually"]),
    _A("european-badger","European Badger",1,"woods","Europe","European badger",4,5,4,1,7,"Setts Builder",["Lives in clans up to 30","Setts are complex underground homes","Most active at dusk"]),
    _A("alpine-ibex","Alpine Ibex",2,"woods","Europe","Alpine ibex",1,5,5,1,6,"Vertical Wall Climb",["Climbs near-vertical cliffs","Once nearly extinct","Curving horns weigh 6kg"]),
    _A("chamois","Chamois",2,"woods","Europe","Chamois",1,5,5,1,7,"Cliff Sprint",["Native to European mountains","Excellent eyesight","Can leap 2m vertically"]),
    _A("eurasian-eagle-owl","Eurasian Eagle-Owl",2,"woods","Europe","Eurasian eagle-owl",10,7,5,1,5,"Silent Owl Wings",["Largest owl species","Hoots audible 4 km","Pierces prey with talons"]),
    _A("pine-marten","Pine Marten",2,"woods","Europe","Pine marten",7,8,4,1,6,"Arboreal Sprint",["Tail nearly as long as body","Hunts squirrels in trees","Eats berries and birds"]),
    _A("western-capercaillie","Western Capercaillie",3,"woods","Europe","Western capercaillie",2,4,4,1,4,"Lekking Display",["Largest grouse","Males 'lek' to impress females","Endangered in many countries"]),
    _A("european-hedgehog","European Hedgehog",1,"woods","Europe","European hedgehog",4,4,3,1,7,"Spine Ball",["Has 5000 spines","Curls into a ball when threatened","Hibernates in winter"]),
    _A("red-squirrel","Eurasian Red Squirrel",1,"woods","Europe","Red squirrel",2,4,3,1,7,"Acrobat Leap",["Threatened by grey squirrel","Builds dreys in trees","Caches food for winter"]),
    _A("european-robin","European Robin",1,"woods","Europe","European robin",4,2,3,1,8,"Territorial Song",["Defends winter territory year-round","UK's national bird","Famously friendly to gardeners"]),
    # Northern/Tundra → wastes
    _A("reindeer","Reindeer",2,"wastes","Arctic","Reindeer",1,3,5,2,6,"Antlered Sled-Pull",["Both sexes have antlers","Eyes change color seasonally","Domesticated by Sami"]),
    _A("arctic-fox","Arctic Fox",2,"wastes","Arctic","Arctic fox",7,7,5,2,5,"Snow Camouflage",["Coat turns white in winter","Survives -50°C","Smallest canid"]),
    _A("norwegian-lemming","Norwegian Lemming",1,"wastes","Arctic","Norwegian lemming",2,3,4,1,7,"Population Boom",["Population explodes every 4 years","Does NOT actually jump off cliffs (myth)","Aggressive when cornered"]),
    # Southern Europe
    _A("iberian-lynx","Iberian Lynx",4,"woods","Iberia","Iberian lynx",10,9,5,1,2,"Rabbit-Specialist Stalk",["Once 100 individuals left","Now recovering","Tufted ears and beard"]),
    _A("mediterranean-monk-seal","Mediterranean Monk Seal",5,"ocean","Med","Mediterranean monk seal",9,8,6,1,1,"Cave Refuge",["Critically endangered","Hides in sea caves","One of rarest pinnipeds"]),
    _A("barbary-macaque","Barbary Macaque",3,"woods","N. Africa","Barbary macaque",5,4,4,1,4,"Tail-less Frolic",["Only wild monkey in Europe","Lives on Gibraltar","Tail-less"]),
    _A("hermanns-tortoise","Hermann's Tortoise",3,"woods","S. Europe","Hermann's tortoise",1,4,3,1,4,"Mediterranean Shell",["Yellow-banded shell","Eats wild flowers","Hibernates in winter"]),

    # === EAST ASIA / TEMPERATE → woods ===
    _A("giant-panda","Giant Panda",4,"woods","E. Asia","Giant panda",2,4,5,1,4,"Bamboo Crusher",["Eats 12kg bamboo daily","Symbol of WWF","Recovered from endangered"]),
    _A("siberian-tiger","Siberian Tiger",5,"woods","E. Asia","Siberian tiger",10,8,9,1,2,"Snow-Bound Hunter",["Largest tiger subspecies","Survives -45°C","Critically endangered"]),
    _A("amur-leopard","Amur Leopard",5,"woods","E. Asia","Amur leopard",10,9,7,1,1,"Frosted Spot Stalk",["Rarest big cat","Fewer than 100 in wild","Thick coat for snow"]),
    _A("przewalski-horse","Przewalski's Horse",5,"woods","E. Asia","Przewalski's horse",1,4,5,2,2,"True Wild Horse",["Only true wild horse species","Extinct in wild, reintroduced","65 chromosomes vs domestic 64"]),
    _A("saiga","Saiga Antelope",5,"woods","E. Asia","Saiga antelope",1,4,6,1,1,"Trunk Filter Snout",["Distinctive bulbous nose","Population crashed 95%","Recovering rapidly"]),
    _A("bactrian-camel","Bactrian Camel",4,"woods","E. Asia","Bactrian camel",1,3,4,2,3,"Two-Hump Resilience",["Has TWO humps","Wild population <1000","Survives -40°C to +40°C"]),
    _A("japanese-macaque","Japanese Macaque",2,"woods","E. Asia","Japanese macaque",4,4,5,1,7,"Hot Spring Bather",["Famous for bathing in hot springs","Northernmost primate (besides humans)","Cultural learning observed"]),
    _A("tanuki","Tanuki",2,"woods","E. Asia","Japanese raccoon dog",6,5,4,3,7,"Folklore Shapeshifter",["Sacred trickster in Japanese folklore","Only canid that hibernates","Looks like a raccoon but is a dog"]),
    _A("eurasian-lynx","Eurasian Lynx",2,"woods","Eurasia","Eurasian lynx",10,8,6,1,5,"Tufted Ear Ambush",["Largest lynx species","Hunts deer","Almost extinct in Europe, recovering"]),
    _A("golden-pheasant","Golden Pheasant",2,"woods","E. Asia","Golden pheasant",4,5,4,1,6,"Plume Cape",["Males have golden cape feathers","Native to mountain forests","Common in collections worldwide"]),

    # === OCEANIA → outback ===
    _A("red-kangaroo","Red Kangaroo",1,"outback","Australia","Red kangaroo",1,3,5,2,7,"Pouch Leap",["Largest marsupial","Can leap 9m","Cannot walk backwards"]),
    _A("emu","Emu",1,"outback","Australia","Emu",4,3,5,2,7,"Flightless Sprint",["Second tallest bird","On Australian coat of arms","Males raise chicks"]),
    _A("koala","Koala",3,"outback","Australia","Koala",2,4,4,1,4,"Eucalyptus Detox",["Sleeps 20 hrs/day","Only eats eucalyptus","Has fingerprints"]),
    _A("dingo","Dingo",2,"outback","Australia","Dingo",8,5,7,3,5,"Ancestral Hunter",["Australia's apex predator","Cannot bark, only howls","Wild dog descended from Asian wolves"]),
    _A("wombat","Common Wombat",1,"outback","Australia","Common wombat",1,4,4,1,7,"Cube-Shaped Poop",["Produces cube-shaped poop","Has a backwards pouch","Burrows up to 30m long"]),
    _A("echidna","Short-beaked Echidna",1,"outback","Australia","Short-beaked echidna",4,5,4,1,7,"Quilled Egg-Layer",["One of the only egg-laying mammals","Sticky tongue for ants","Quills like a porcupine"]),
    _A("thorny-devil","Thorny Devil",2,"outback","Australia","Thorny devil",4,7,3,1,5,"Capillary Water Wick",["Drinks water through its skin","Eats only ants","Walks with comical sway"]),
    _A("frilled-lizard","Frilled-neck Lizard",2,"outback","Australia","Frilled-neck lizard",6,5,3,1,6,"Frill Display",["Frill expands to 30cm","Runs on hind legs","Made famous by Jurassic Park"]),
    _A("wedge-tailed-eagle","Wedge-tailed Eagle",1,"outback","Australia","Wedge-tailed eagle",10,5,6,1,6,"Eyrie Sentinel",["Largest raptor in Australia","Wingspan 2.3m","Hunts kangaroos in pairs"]),
    _A("laughing-kookaburra","Laughing Kookaburra",1,"outback","Australia","Laughing kookaburra",6,3,4,2,7,"Cackling Call",["Famous laughing call","Largest kingfisher","Lives in family groups"]),
    _A("inland-taipan","Inland Taipan",3,"outback","Australia","Inland taipan",10,9,5,1,5,"World's Most Toxic Venom",["Most venomous land snake","One bite could kill 100 men","Highly reclusive"]),
    _A("tasmanian-devil","Tasmanian Devil",4,"outback","Tasmania","Tasmanian devil",8,6,5,1,2,"Skull-Crushing Jaws",["Has the strongest bite per body size","Devil facial tumor threatens species","Screams loudly at night"]),
    _A("cassowary","Southern Cassowary",3,"outback","Australia","Southern cassowary",4,5,6,1,4,"Dagger Kick",["Most dangerous bird","Foot has dagger-like claw","Helmet of keratin on head"]),
    _A("tree-kangaroo","Lumholtz's Tree-Kangaroo",4,"outback","Australia","Lumholtz's tree-kangaroo",2,7,4,1,3,"Arboreal Bound",["Lives in trees","Can leap 9m down to ground","Endangered"]),
    _A("sugar-glider","Sugar Glider",1,"outback","Australia","Sugar glider",4,5,3,2,7,"Patagium Glide",["Glides 50m between trees","Loves sweet sap","Marsupial like opossums"]),
    _A("platypus","Platypus",3,"outback","Australia","Platypus",6,7,5,1,5,"Electroreception Beak",["Lays eggs but is a mammal","Males have venomous spurs","Detects prey via electricity"]),
    _A("saltwater-crocodile","Saltwater Crocodile",1,"outback","Australia","Saltwater crocodile",10,5,7,3,7,"Death Roll",["Largest living reptile","Most powerful bite ever measured","Crosses oceans"]),
    _A("quokka","Quokka",3,"outback","Australia","Quokka",1,4,3,1,5,"Smiling Selfie",["Happiest animal on earth","Sometimes called marsupial-faced","Native to Rottnest Island"]),
    _A("bird-of-paradise","Raggiana Bird-of-Paradise",2,"outback","New Guinea","Raggiana bird-of-paradise",4,5,4,1,5,"Plume Mating Dance",["National bird of Papua New Guinea","Males perform elaborate dances","Stunning plumage"]),
    _A("lyrebird","Superb Lyrebird",2,"outback","Australia","Superb lyrebird",4,5,4,1,6,"Sonic Mimic",["Mimics chainsaws and cameras","Tail looks like a lyre","Best vocal mimic of any bird"]),
    _A("kiwi","Brown Kiwi",4,"outback","New Zealand","North Island brown kiwi",6,7,5,1,3,"Sniffing Beak",["Only bird with nostrils on beak tip","Lays largest egg relative to body","National icon of NZ"]),
    _A("kakapo","Kakapo",5,"outback","New Zealand","Kākāpō",2,8,5,1,1,"Flightless Boom",["Heaviest parrot, cannot fly","Booms loudly to attract mates","Critically endangered"]),
    _A("kea","Kea",3,"outback","New Zealand","Kea",6,5,4,2,4,"Alpine Parrot Wit",["Only alpine parrot","Notoriously curious","Solves complex puzzles"]),
    _A("tuatara","Tuatara",4,"outback","New Zealand","Tuatara",6,6,4,1,3,"Third Eye Sense",["Has a parietal third eye","Lineage 200 million years old","Lives over 100 years"]),
    _A("weta","Giant Weta",3,"outback","New Zealand","Giant weta",4,5,3,1,3,"Ancient Cricket",["One of the heaviest insects","Survived 190 million years","Endemic to NZ"]),

    # === ANTARCTICA / OCEAN ===
    _A("emperor-penguin","Emperor Penguin",3,"wastes","Antarctica","Emperor penguin",7,3,5,1,4,"Huddle Insulation",["Largest penguin","Males incubate egg on feet","Dives 500m deep"]),
    _A("adelie-penguin","Adélie Penguin",1,"wastes","Antarctica","Adélie penguin",6,3,4,1,5,"Pebble Nest",["Tuxedoed penguin","Males offer pebble gifts","Travels 13,000 km annually"]),
    _A("leopard-seal","Leopard Seal",2,"wastes","Antarctica","Leopard seal",10,5,7,1,5,"Underwater Ambush",["Apex predator of Antarctica","Eats penguins","Vocalizes underwater"]),
    _A("weddell-seal","Weddell Seal",1,"wastes","Antarctica","Weddell seal",9,4,5,1,6,"Ice-Hole Breath",["Lives furthest south","Holds breath 80 minutes","Keeps breathing holes open with teeth"]),
    _A("snow-petrel","Snow Petrel",1,"wastes","Antarctica","Snow petrel",5,3,4,1,6,"Whiteout Flight",["Pure white plumage","Nests on rocky outcrops","Stomach oil defense"]),
    _A("wandering-albatross","Wandering Albatross",3,"ocean","S. Ocean","Wandering albatross",6,3,5,1,4,"3.5m Wingspan Glide",["Largest wingspan of any bird","Can soar for hours without flapping","Mates for life"]),
    _A("orca","Orca",2,"ocean","Global","Killer whale",10,5,9,1,6,"Pod Tactics",["Apex ocean predator","Distinct cultural pods","Largest dolphin"]),
    _A("blue-whale","Blue Whale",4,"ocean","Global","Blue whale",3,3,10,1,3,"Loudest Voice on Earth",["Largest animal ever","Heart weighs 180 kg","Heard 1600 km away"]),
    _A("great-white-shark","Great White Shark",3,"ocean","Global","Great white shark",10,6,8,1,5,"Breach Attack",["Detects 1 drop of blood in 100L","Senses electric fields","Breaches 3m out of water"]),
    _A("whale-shark","Whale Shark",3,"ocean","Tropics","Whale shark",3,3,7,1,4,"Filter-Feed Cruiser",["Largest fish","Eats plankton","Spots are unique like fingerprints"]),
    _A("manta-ray","Manta Ray",3,"ocean","Tropics","Manta ray",3,4,5,1,4,"Wing Soar",["Wingspan up to 7m","Largest brain of any fish","Visits cleaning stations"]),
    _A("humpback-whale","Humpback Whale",2,"ocean","Global","Humpback whale",3,4,7,1,6,"Bubble Net Hunt",["Famous for songs","Bubble-nets sardines","Migrates 8000 km"]),
    _A("narwhal","Narwhal",4,"ocean","Arctic","Narwhal",8,7,5,1,4,"Tusk Sense",["Unicorn of the sea","Tusk is a sensory organ","Lives in Arctic only"]),
    _A("leatherback-sea-turtle","Leatherback Sea Turtle",5,"ocean","Global","Leatherback sea turtle",4,5,5,1,1,"Jellyfish Drift",["Largest turtle","Dives 1200m","No hard shell, leathery skin"]),
    _A("colossal-squid","Colossal Squid",5,"ocean","Antarctic","Colossal squid",10,10,4,1,3,"Hook-Tipped Tentacles",["Largest invertebrate","Eyes size of beach balls","Lives in deep cold waters"]),
]

# Sanity: build by-region lookup
def by_region():
    out = {}
    for a in ANIMALS:
        out.setdefault(a["region"], []).append(a)
    return out

def by_id():
    return {a["id"]: a for a in ANIMALS}
