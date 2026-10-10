// d = orbit distance, r = visual radius, s = orbit speed, c = fallback colour
export const BODIES = [
 { name:'Sun', r:6, d:0, s:0, c:'#ffb347', facts:{Type:'G-type star',Diameter:'1.39M km',Surface:'5,500 °C',Mass:'333,000 Earths'},
   info:'The Sun holds 99.8% of the solar system\'s mass. Its gravity keeps every planet, comet and speck of dust in orbit.',
   q:{q:'What share of the solar system\'s mass is the Sun?',o:['About 50%','About 75%','About 99.8%'],a:2}},
 { name:'Mercury', r:.9, d:11, s:4.15, c:'#a89f94', facts:{Diameter:'4,879 km',Day:'59 Earth days',Year:'88 days',Moons:'0'},
   info:'The smallest planet and the fastest, racing around the Sun at about 47 km every second. With almost no atmosphere, its days scorch and its nights freeze.',
   q:{q:'How long is a year on Mercury?',o:['88 Earth days','225 Earth days','365 Earth days'],a:0}},
 { name:'Venus', r:1.5, d:16, s:1.62, c:'#e8c27a', facts:{Diameter:'12,104 km',Day:'243 Earth days',Year:'225 days',Moons:'0'},
   info:'A thick carbon-dioxide atmosphere traps heat in a runaway greenhouse effect, making Venus the hottest planet, hot enough to melt lead.',
   q:{q:'Which planet is the hottest?',o:['Mercury','Venus','Mars'],a:1}},
 { name:'Earth', r:1.6, d:22, s:1, c:'#4a86d8', facts:{Diameter:'12,742 km',Day:'24 hours',Year:'365 days',Moons:'1'},
   info:'The third planet from the Sun and the only world known to harbor life. Liquid water covers about 71% of its surface.',
   q:{q:'How much of Earth\'s surface is water?',o:['About 71%','About 50%','About 90%'],a:0}},
 { name:'Mars', r:1.2, d:28, s:.53, c:'#c1563a', facts:{Diameter:'6,779 km',Day:'24.6 hours',Year:'687 days',Moons:'2'},
   info:'Home to Olympus Mons, the tallest volcano known. Its two tiny moons, Phobos and Deimos, may be captured asteroids.',
   q:{q:'What are the names of Mars\'s moons?',o:['Io and Europa','Phobos and Deimos','Titan and Rhea'],a:1}},
 { name:'Jupiter', r:3.8, d:42, s:.084, c:'#d2a679', facts:{Diameter:'139,820 km',Day:'9.9 hours',Year:'11.9 years',Moons:'95'},
   info:'The largest planet: 1,000 Earths could fit inside. Its Great Red Spot is a storm that has raged for centuries.',
   q:{q:'What is Jupiter\'s Great Red Spot?',o:['A volcano','A giant storm','A crater'],a:1}},
 { name:'Saturn', r:3.2, d:56, s:.034, c:'#e3cf9a', rings:true, facts:{Diameter:'116,460 km',Day:'10.7 hours',Year:'29.4 years',Moons:'146'},
   info:'Famous for its rings of ice and rock. Saturn is so light for its size that it would float in a bathtub big enough to hold it.',
   q:{q:'What are Saturn\'s rings mostly made of?',o:['Ice and rock','Gas','Liquid water'],a:0}},
 { name:'Uranus', r:2.2, d:70, s:.012, c:'#8fe3e8', facts:{Diameter:'50,724 km',Day:'17 hours',Year:'84 years',Moons:'28'},
   info:'An ice giant that rolls around the Sun tipped on its side, so each pole gets 42 years of sunlight followed by 42 years of dark.',
   q:{q:'How is Uranus unusual?',o:['It spins on its side','It has no gravity','It is hotter than Venus'],a:0}},
 { name:'Neptune', r:2.1, d:83, s:.006, c:'#4465e8', facts:{Diameter:'49,244 km',Day:'16 hours',Year:'165 years',Moons:'16'},
   info:'The windiest world, with supersonic storms over 2,000 km/h. Neptune was found by mathematics before anyone saw it through a telescope.',
   q:{q:'How was Neptune first predicted?',o:['By mathematics','By a space probe','By radio signals'],a:0}},
]
export const RANKS = [[0,'Cadet'],[100,'Navigator'],[200,'Pathfinder'],[350,'Commander'],[500,'Galactic Glider']]
export const rankOf = xp => [...RANKS].reverse().find(r => xp >= r[0])[1]
export const MAX_XP = 540
