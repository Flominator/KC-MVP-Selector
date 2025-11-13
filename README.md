# KC-MVP-Selector
Most-Valued-Player (MVP) Selector, designed for King's Choice Alliance Leaders and Deputies for RNG their MVP selection, based on a weighted system and option to change individual members eligibility for MVP selection. 

It does also have the option to log Title earnings - so you can keep track of who earns a Title given by the Alliance MVP or if it was won individually.

Database and Authentication system is fixed by Firebase.

If you already have some data you would like to feed it, you can do so by Import - or you can Export the data already listed.

IMPORTANT! - File formats currently used for upload:

  Members file:  
    &nbsp;&nbsp;&nbsp;&nbsp;Name,Eligible  
    &nbsp;&nbsp;&nbsp;&nbsp;John,True  
    &nbsp;&nbsp;&nbsp;&nbsp;Sarah,False  
    &nbsp;&nbsp;&nbsp;&nbsp;Mike,True  
    &nbsp;&nbsp;&nbsp;&nbsp;...  

  MVP History (.TXT):  
  &nbsp;&nbsp;&nbsp;&nbsp;...  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-10 || Siege of the Undead || John  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-09 || Chess CS || Sarah  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-08 || Alliance EXP Growth || Mike  
  &nbsp;&nbsp;&nbsp;&nbsp;...  
  
  Title History (.TXT):  
  &nbsp;&nbsp;&nbsp;&nbsp;...  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-15T10:30:00 || King (Ally) || John  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-10T14:20:00 || Duke || Sarah  
  &nbsp;&nbsp;&nbsp;&nbsp;2025-01-05T09:15:00 || Earl || Mike  
