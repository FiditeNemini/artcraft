# bt(note): found at https://www.youtube.com/watch?v=f7ZPc3OR9EU
# segment_files.praat
# Ricardo A. H. Bion, 02/05/2009

form SEGMENT FILES
	sentence File_to_read_from: /home/bt/dev/trumpet/samples/sample-frankly-ukraine.wav
	sentence Directory_to_save_segmented_files: /home/bt/dev/trumpet/output
endform

writeInfoLine: "test"

select all
nocheck Remove

appendInfoLine: "reading"

sound = Read from file... 'file_to_read_from$'
text = To TextGrid (silences)...  100 0  -40 0.4 0.1 silent sounding
select all
Extract intervals where... 1 no "is equal to" sounding
select text
plus sound
Remove

appendInfoLine: "read"

select all
numberOfSounds = numberOfSelected()

for i to numberOfSounds
        appendInfoLine: "testx"
	sound_'i' = selected("Sound", 'i')
endfor

for i to numberOfSounds
        appendInfoLine: "testy"
	select sound_'i'
	#Write to AIFF file... 'directory_to_save_segmented_files$''i'.aiff
	Write to WAV file... 'directory_to_save_segmented_files$''i'.wav
endfor

appendInfoLine: "done"

select all
Remove
