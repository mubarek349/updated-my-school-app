import React from 'react'

type StudentPerChapterProps = {
  chapterId: string | number;
};

function StudentPerChapter({ chapterId }: StudentPerChapterProps) {
  return (
    <div>
      <h1>This is a student per chapter</h1>
      <p>Chapter ID: {chapterId}</p>
    </div>
  );
}

export default StudentPerChapter;