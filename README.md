# Reading Advantage: An AI-Enhanced Language Learning Experience | ประสบการณ์การเรียนภาษาที่เสริมด้วย AI

## Introduction | บทนำ
Welcome to Reading Advantage, a groundbreaking platform that combines extensive reading with cutting-edge AI technologies to elevate language learning experiences. Our mission is to provide users with engaging, personalized, and effective tools for mastering new languages. | ยินดีต้อนรับสู่ Reading Advantage แพลตฟอร์มที่ล้ำสมัยซึ่งรวมการอ่านอย่างกว้างขวางเข้ากับเทคโนโลยี AI ที่ทันสมัยเพื่อยกระดับประสบการณ์การเรียนรู้ภาษา ภารกิจของเราคือการให้เครื่องมือที่น่าสนใจ ปรับแต่งได้ และมีประสิทธิภาพในการเรียนรู้ภาษาสำหรับผู้ใช้

## Technical Overview | ภาพรวมทางเทคนิค
This section delves into the technical architecture, development practices, and functionalities of our system. | ส่วนนี้จะเจาะลึกถึงสถาปัตยกรรมทางเทคนิค วิธีการพัฒนา และฟังก์ชันการทำงานของระบบของเรา

### Platform Architecture | สถาปัตยกรรมแพลตฟอร์ม
- **Frontend and Backend:** Utilizing Next.js for cohesive full-stack development, with server-side rendering to enhance UI responsiveness and backend efficiency. | ใช้ Next.js สำหรับการพัฒนาแบบครบวงจร พร้อมด้วยการเรนเดอร์ฝั่งเซิร์ฟเวอร์เพื่อเพิ่มความตอบสนองของ UI และประสิทธิภาพของ backend
- **Authentication:** Secure user authentication through Firebase integration. | การตรวจสอบสิทธิ์ของผู้ใช้ที่ปลอดภัยผ่านการรวม Firebase
- **Hosting and Data Storage:** Hosted on Google Cloud Platform for robust performance and scalability, with reliable database solutions. | โฮสต์บน Google Cloud Platform เพื่อประสิทธิภาพและการปรับขนาดที่แข็งแกร่ง พร้อมด้วยโซลูชั่นฐานข้อมูลที่เชื่อถือได้
- **AI Integration:** | การรวม AI
  - **Article Generation:** Creating diverse, engaging materials with OpenAI Assistant APIs. | การสร้างเนื้อหาที่หลากหลายและน่าสนใจด้วย OpenAI Assistant APIs
  - **Image Generation:** Utilizing DALL-E 3 for generating relevant and vivid imagery. | ใช้ DALL-E 3 สำหรับการสร้างภาพที่เกี่ยวข้องและสดใส
  - **Text-to-Speech (TTS):** Implementing Google's Neural2 TTS for natural and clear audio experiences. | ใช้ Google's Neural2 TTS สำหรับประสบการณ์เสียงที่เป็นธรรมชาติและชัดเจน

### Development Methodology | วิธีการพัฒนา
Our development approach emphasizes agility, scalability, and user-centric design: | วิธีการพัฒนาของเรามุ่งเน้นที่ความคล่องตัว การปรับขนาด และการออกแบบที่เน้นผู้ใช้เป็นศูนย์กลาง
- **Agile Development:** Rapid iteration and continuous improvement facilitated by agile methodologies. | การพัฒนาแบบ Agile: การวนรอบอย่างรวดเร็วและการปรับปรุงอย่างต่อเนื่องโดยใช้วิธีการแบบ Agile
- **Modular Design:** Ensuring reusable, maintainable, and scalable components. | การออกแบบแบบแยกส่วน: เพื่อให้แน่ใจว่ามีส่วนประกอบที่สามารถนำกลับมาใช้ใหม่ได้ บำรุงรักษาง่าย และปรับขนาดได้
- **Testing and Quality Assurance:** Rigorous testing protocols to ensure reliable performance of all components. | การทดสอบและการประกันคุณภาพ: การทดสอบอย่างเข้มงวดเพื่อให้แน่ใจว่ามีประสิทธิภาพที่เชื่อถือได้ของส่วนประกอบทั้งหมด

## Core Features | คุณสมบัติเบื้องต้น
### Extensive Reading Library | ห้องสมุดการอ่านอย่างกว้างขวาง
AI-curated materials designed to cater to all user proficiency levels. | เนื้อหาที่คัดสรรโดย AI ออกแบบมาเพื่อรองรับทุกระดับความสามารถของผู้ใช้

### User-Driven Learning Activities | กิจกรรมการเรียนรู้ที่ผู้ใช้กำหนดเอง
- **Reading Articles | การอ่านบทความ**
- **Answering MC and Short-Answer Questions | การตอบคำถามแบบหลายตัวเลือกและคำตอบสั้น**
- **Writing Long-Form Responses to Prompts | การเขียนตอบสนองในรูปแบบยาวต่อคำแนะนำ**
- **Saving Sentences or Vocabulary for Later Practice | การบันทึกประโยคหรือคำศัพท์เพื่อฝึกฝนในภายหลัง**
  - Activities include flashcards, matching, spelling, sentence ordering, and word ordering. | กิจกรรมรวมถึงการใช้แฟลชการ์ด การจับคู่ การสะกดคำ การเรียงประโยค และการเรียงคำ

### Interactive Exercises and Feedback | แบบฝึกหัดและข้อเสนอแนะเชิงโต้ตอบ
- **AI-Powered Writing Feedback:** Initial drafts are marked using a 5-point rubric with specific, actionable feedback. | ข้อเสนอแนะการเขียนที่ขับเคลื่อนด้วย AI: ร่างแรกจะได้รับการประเมินโดยใช้รูบริก 5 จุดพร้อมข้อเสนอแนะที่เฉพาะเจาะจงและนำไปใช้ได้จริง
- **Question Generation:** Automatically generated questions to test comprehension. | การสร้างคำถาม: การสร้างคำถามอัตโนมัติเพื่อทดสอบความเข้าใจ
- **Context-Sensitive Definitions and Translations:** Providing immediate and relevant vocabulary support. | คำจำกัดความและการแปลตามบริบท: การให้การสนับสนุนคำศัพท์ที่ทันทีและเกี่ยวข้อง

### Spaced Repetition System (SRS) | ระบบการทบทวนแบบเว้นช่วง
- **SRS Flashcard Practice:** State-of-the-art flashcard practice for effective vocabulary retention. | การฝึกฝนแฟลชการ์ด SRS: การฝึกฝนแฟลชการ์ดที่ทันสมัยเพื่อการคงคำศัพท์อย่างมีประสิทธิภาพ

## Progress Tracking | การติดตามความก้าวหน้า
- **XP System:** Progress is tracked using an XP system based on Cambridge's CEFR study time estimations. | ระบบ XP: การติดตามความก้าวหน้าโดยใช้ระบบ XP ที่อิงตามการประมาณเวลาการศึกษาของ CEFR ของ Cambridge
- **Activity-Based XP Awards:** XP are awarded based on the estimated time and effort required for each activity. | รางวัล XP ตามกิจกรรม: XP จะได้รับตามเวลาที่ประมาณและความพยายามที่ต้องใช้สำหรับแต่ละกิจกรรม

## Upcoming Features | คุณสมบัติที่จะมาถึง
- **Enhanced AI Personalization:** More advanced AI-driven content recommendations. | การปรับแต่ง AI ที่ปรับปรุง: คำแนะนำเนื้อหาที่ขับเคลื่อนด้วย AI ที่ล้ำหน้ามากขึ้น
- **Expanded Community Features:** Tools to foster user interaction and collaborative learning. | คุณสมบัติชุมชนที่ขยาย: เครื่องมือเพื่อส่งเสริมการโต้ตอบของผู้ใช้และการเรียนรู้ร่วมกัน
- **Advanced Administrative Tools:** Enhanced functionalities for teachers and school administrators. | เครื่องมือการจัดการขั้นสูง: ฟังก์ชั่นที่ปรับปรุงสำหรับครูและผู้ดูแลโรงเรียน

## Development Challenges and Resolutions | ความท้าทายและการแก้ไขในการพัฒนา
An in-depth look at the challenges faced during development, such as AI service integration and user data security, and the solutions implemented to overcome these obstacles. | การเจาะลึกถึงความท้าทายที่พบระหว่างการพัฒนา เช่น การรวมบริการ AI และความปลอดภัยของข้อมูลผู้ใช้ และการแก้ปัญหาที่นำมาใช้เพื่อเอาชนะอุปสรรคเหล่านี้

## Detailed Roadmap | แผนงานโดยละเอียด
1. [x] Article Level Functions | ฟังก์ชั่นระดับบทความ
2. [x] Simple Frontend | อินเตอร์เฟซหน้าจอง่าย
3. [x] Auth System & Level Tracking | ระบบตรวจสอบสิทธิ์และการติดตามระดับ
4. [x] Article Images | ภาพประกอบบทความ
5. [x] Audio with Highlighting | เสียงพร้อมไฮไลท์ประโยค
6. [x] Translation Pane | บานหน้าต่างการแปล
7. [x] Sentence Saving | การบันทึกประโยค
8. [x] Sentence SRS Practice | การฝึกประโยชน์ SRS
8. [x] Article Vocabulary Lists | รายการคำศัพท์ของบทความ
8. [ ] Vocabulary SRS Practice | การฝึกฝนคำศัพท์ SRS
9. [x] MC and SA Comprehension Questions | คำถามความเข้าใจแบบหลายตัวเลือกและคำตอบสั้น
9. [ ] First-run Tour | การแนะนำการใช้งานครั้งแรก
9. [x] "Ask Questions About the Language in This Article" Chatbot | แชทบอทสำหรับถามคำถามเกี่ยวกับภาษาในบทความนี้
10. [ ] LA Writing Prompts and Feedback | คำแนะนำในการเขียนและข้อเสนอแนะ
11. [ ] Running Records | การบันทึกการวิ่ง
12. [x] Teacher & Classroom Management | การจัดการครูและห้องเรียน
13. [ ] School Admin Management | การจัดการผู้ดูแลโรงเรียน
14. [x] App Admin Functions | ฟังก์ชั่นผู้ดูแลแอป

## Usage

 and User Experience | การใช้งานและประสบการณ์ของผู้ใช้
- **User Choice and Motivation:** The advantage in Reading Advantage is student choice. Students choose the article they want to read, the activities they want to do, and the vocabulary or sentences they want to save for later practice. This choice enhances motivation and engagement. | ข้อดีของ Reading Advantage คือการให้ผู้เรียนเลือกสิ่งที่ต้องการอ่าน กิจกรรมที่ต้องการทำ และคำศัพท์หรือประโยคที่ต้องการบันทึกเพื่อฝึกฝนในภายหลัง การเลือกนี้ช่วยเพิ่มแรงจูงใจและการมีส่วนร่วม
- **Activity Options | ตัวเลือกกิจกรรม**
  - **Reading Articles | การอ่านบทความ**
  - **Answering MC and Short-Answer Questions | การตอบคำถามแบบหลายตัวเลือกและคำตอบสั้น**
  - **Writing Long-Form Responses | การเขียนตอบสนองในรูปแบบยาว**
  - **Sentence and Vocabulary Practice | การฝึกประโยคและคำศัพท์**
  - **SRS Flashcard Practice | การฝึกฝนแฟลชการ์ดแบบ SRS**

## Progress Tracking | การติดตามความก้าวหน้า
- **XP System:** The system uses XP to track progress. XP awards are based on the estimated time and effort required for each activity, following Cambridge's CEFR study time estimations. | ระบบ XP: ระบบใช้ XP ในการติดตามความก้าวหน้า รางวัล XP จะได้รับตามเวลาที่ประมาณและความพยายามที่ต้องใช้สำหรับแต่ละกิจกรรม โดยอิงตามการประมาณเวลาการศึกษาของ CEFR ของ Cambridge

## AI-Powered Feedback and Assistance | ข้อเสนอแนะและความช่วยเหลือที่ใช้ AI
- **Writing Feedback:** The AI marks the first draft on a 5-point rubric with specific, actionable feedback, allowing the student to revise and resubmit. | ข้อเสนอแนะการเขียน: AI จะประเมินร่างแรกโดยใช้รูบริก 5 จุด พร้อมข้อเสนอแนะที่เฉพาะเจาะจงและนำไปใช้ได้จริง ช่วยให้ผู้เรียนแก้ไขและส่งใหม่ได้
- **Question Generation:** AI generates questions to test comprehension. | การสร้างคำถาม: AI สร้างคำถามเพื่อทดสอบความเข้าใจ
- **Context-Sensitive Definitions and Translations:** AI provides immediate and relevant vocabulary support. | คำจำกัดความและการแปลตามบริบท: AI ให้การสนับสนุนคำศัพท์ที่ทันทีและเกี่ยวข้อง
- **Interactive Chatbot:** Students can use the chatbot to ask questions about articles. | แชทบอทแบบโต้ตอบ: ผู้เรียนสามารถใช้แชทบอทเพื่อถามคำถามเกี่ยวกับบทความ

## Teacher and Admin Tools | เครื่องมือสำหรับครูและผู้ดูแลระบบ
- **Teacher & Classroom Management:** Tools for managing classrooms and student progress. | การจัดการครูและห้องเรียน: เครื่องมือสำหรับการจัดการห้องเรียนและความก้าวหน้าของนักเรียน
- **School Admin Management:** Advanced functionalities for school administrators. | การจัดการผู้ดูแลโรงเรียน: ฟังก์ชั่นขั้นสูงสำหรับผู้ดูแลโรงเรียน
- **App Admin Functions:** Comprehensive administrative tools for app management. | ฟังก์ชั่นผู้ดูแลแอป: เครื่องมือการจัดการแอปที่ครอบคลุม

## Contributions and Development | การมีส่วนร่วมและการพัฒนา
Information on how to contribute to the project and details on ongoing development efforts. | ข้อมูลเกี่ยวกับวิธีการมีส่วนร่วมในโครงการและรายละเอียดเกี่ยวกับความพยายามในการพัฒนาอย่างต่อเนื่อง

## Contact and Support | ติดต่อและสนับสนุน
For further information or support, please contact Reading Advantage (Thailand) at admin@reading-advantage.com. | สำหรับข้อมูลเพิ่มเติมหรือต้องการการสนับสนุน กรุณาติดต่อ Reading Advantage (ประเทศไทย) ที่ admin@reading-advantage.com

---

## Team Members | สมาชิกในทีม
- **Project Manager:** Daniel Bo (bodangren and Reading Advantage)
- **Founding Developer:** Passakorn "Boss" (Boss4848)
- **React Developer:** Saeree "Yo" (rtclub11140)
- **Full-time Developer:** Pawida "May" (pawidachum)
- **Part-time Developer:** Puttipong "Max" (puttipongmax)

For further assistance or inquiries, feel free to reach out to any of our team members. | สำหรับความช่วยเหลือเพิ่มเติมหรือข้อสงสัย สามารถติดต่อสมาชิกในทีมของเราได้ทุกคน
