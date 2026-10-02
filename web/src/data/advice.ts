import { majorIndexFor, meaningFor, type Card } from './meanings'
import { minorNotes } from './minor'

type CardAdvice = {
  focus: string
  notice: string
  action: string
  question: string
}

type ReadingAdvice = {
  summary: string
  steps: Array<{ label: string; text: string }>
}

const majorAdvice: Record<number, CardAdvice> = {
  0: { focus: 'một khởi đầu', notice: 'Bạn đang chờ mình đủ sẵn sàng trước khi bắt đầu điều gì?', action: 'Chọn một điều muốn thử và làm phiên bản nhỏ nhất của nó trong 24 giờ tới.', question: 'Nếu bớt sợ sai, bạn sẽ bước bước đầu tiên nào?' },
  1: { focus: 'nguồn lực sẵn có', notice: 'Bạn có thể đang đánh giá thấp một kỹ năng hoặc sự giúp đỡ đã nằm trong tay mình.', action: 'Viết ra ba nguồn lực bạn có, rồi dùng ngay một nguồn lực cho việc đang băn khoăn.', question: 'Điều gì bạn đã có mà chưa thực sự dùng đến?' },
  2: { focus: 'trực giác', notice: 'Có một cảm giác xuất hiện trước khi bạn bắt đầu phân tích mọi khả năng.', action: 'Dành mười phút yên tĩnh và ghi lại suy nghĩ đầu tiên, trước khi hỏi ý kiến ai khác.', question: 'Cơ thể bạn thấy nhẹ hơn khi nghĩ tới lựa chọn nào?' },
  3: { focus: 'sự nuôi dưỡng', notice: 'Một ý tưởng hoặc mối quan hệ cần được chăm sóc thay vì thúc ép.', action: 'Dành thời gian cho một việc khiến bạn thấy được tiếp thêm năng lượng.', question: 'Bạn cần chăm sóc điều gì để nó có thể lớn lên?' },
  4: { focus: 'ranh giới rõ ràng', notice: 'Sự thiếu cấu trúc có thể đang lấy bớt năng lượng của bạn.', action: 'Đặt một ranh giới hoặc một lịch trình đơn giản cho việc quan trọng nhất tuần này.', question: 'Bạn cần nói “không” với điều gì để giữ lời “có” quan trọng hơn?' },
  5: { focus: 'một bài học', notice: 'Kinh nghiệm của người đi trước có thể giúp bạn nhìn tình huống rõ hơn.', action: 'Tìm một người bạn tin và hỏi họ một câu hỏi thật cụ thể.', question: 'Bạn muốn học điều gì nhưng vẫn ngại hỏi?' },
  6: { focus: 'một lựa chọn từ trái tim', notice: 'Có thể bạn đang cố làm hài lòng quá nhiều phía cùng lúc.', action: 'Viết ra ba giá trị quan trọng nhất, rồi đối chiếu lựa chọn hiện tại với chúng.', question: 'Lựa chọn nào gần với con người bạn muốn trở thành?' },
  7: { focus: 'một hướng đi', notice: 'Bạn sẽ tiến nhanh hơn khi thôi chia sức cho quá nhiều mục tiêu.', action: 'Chọn một việc ưu tiên và dành riêng 30 phút không bị gián đoạn cho nó.', question: 'Đích nào thật sự xứng đáng với năng lượng của bạn?' },
  8: { focus: 'sức mạnh dịu dàng', notice: 'Ép mình hoặc ép người khác có thể khiến vấn đề căng hơn.', action: 'Bắt đầu cuộc trò chuyện khó bằng việc nói rõ cảm xúc, không đổ lỗi.', question: 'Bạn có thể kiên định mà vẫn tử tế ở chỗ nào?' },
  9: { focus: 'một khoảng lặng', notice: 'Tiếng ồn từ quá nhiều ý kiến có thể che mất điều bạn thực sự muốn.', action: 'Tạm rời màn hình mười lăm phút và viết ra câu trả lời của riêng mình.', question: 'Nếu không cần giải thích cho ai, bạn sẽ chọn gì?' },
  10: { focus: 'sự thay đổi', notice: 'Có phần của tình huống này nằm ngoài tầm kiểm soát của bạn.', action: 'Liệt kê một điều bạn có thể tác động và chỉ hành động trên điều đó hôm nay.', question: 'Bạn có thể linh hoạt ở đâu mà vẫn giữ điều cốt lõi?' },
  11: { focus: 'sự thật và công bằng', notice: 'Một quyết định sẽ dễ hơn khi bạn tách dữ kiện khỏi giả định.', action: 'Viết hai cột: điều bạn biết chắc và điều bạn mới đang suy đoán.', question: 'Nếu nhìn công bằng cho mọi phía, điều gì thay đổi?' },
  12: { focus: 'một góc nhìn khác', notice: 'Càng cố đẩy nhanh, bạn có thể càng bỏ qua một chi tiết quan trọng.', action: 'Tạm hoãn kết luận và hỏi một người có góc nhìn khác bạn.', question: 'Điều gì xuất hiện nếu bạn chấp nhận chậm lại?' },
  13: { focus: 'một điều cần khép lại', notice: 'Bạn có thể đang giữ điều đã không còn phù hợp chỉ vì nó từng quen thuộc.', action: 'Gọi tên một điều muốn buông và làm một việc nhỏ để tạo chỗ cho điều mới.', question: 'Bạn sẽ nhẹ hơn nếu thôi níu giữ điều gì?' },
  14: { focus: 'nhịp cân bằng', notice: 'Hai nhu cầu tưởng đối lập có thể cùng có chỗ trong cuộc sống của bạn.', action: 'Chọn một thói quen nhỏ có thể duy trì đều trong bảy ngày.', question: 'Nhịp nào vừa đủ để bạn tiếp tục mà không kiệt sức?' },
  15: { focus: 'một sự ràng buộc', notice: 'Một thói quen hoặc nỗi sợ có thể đang âm thầm quyết định thay bạn.', action: 'Nhận diện một tác nhân lặp lại và thử thay đổi phản ứng của mình chỉ một lần.', question: 'Điều gì đang có nhiều quyền lực hơn bạn muốn trao cho nó?' },
  16: { focus: 'điều cần xây lại', notice: 'Một nền tảng không vững có thể đang bộc lộ rõ hơn trước.', action: 'Chọn phần nhỏ nhất bạn có thể sửa, và xin hỗ trợ nếu cần.', question: 'Sự thật nào bạn đã thấy nhưng chưa muốn gọi tên?' },
  17: { focus: 'hy vọng có thể chăm sóc', notice: 'Bạn không cần hồi phục hay tiến bộ theo tốc độ của người khác.', action: 'Ghi lại một điều tốt đã xảy ra gần đây và một việc giúp bạn thấy dễ thở hơn.', question: 'Nguồn sáng nhỏ nào vẫn ở bên bạn lúc này?' },
  18: { focus: 'điều còn mơ hồ', notice: 'Cảm xúc đang mạnh có thể khiến suy đoán trông như sự thật.', action: 'Đợi cảm xúc lắng xuống rồi kiểm tra lại một thông tin quan trọng trước khi quyết định.', question: 'Bạn đang biết chắc điều gì, và đang tưởng tượng điều gì?' },
  19: { focus: 'niềm vui và sự rõ ràng', notice: 'Bạn có thể đang quên ghi nhận một tiến bộ đã đạt được.', action: 'Chia sẻ một tin vui hoặc lời cảm ơn với người đã đồng hành cùng bạn.', question: 'Điều gì đang tốt lên mà bạn chưa cho mình quyền tận hưởng?' },
  20: { focus: 'một lần nhìn lại', notice: 'Một bài học cũ đang xuất hiện để bạn lựa chọn khác đi.', action: 'Viết ra điều đã học, điều muốn giữ và điều muốn thay đổi ở chặng tiếp theo.', question: 'Bạn muốn trả lời tiếng gọi nào của chính mình?' },
  21: { focus: 'một vòng tròn hoàn tất', notice: 'Bạn xứng đáng ghi nhận hành trình trước khi vội bước sang việc kế tiếp.', action: 'Liệt kê ba điều đã hoàn thành và chọn cách nhỏ để ăn mừng.', question: 'Bạn muốn mang theo điều gì từ chặng vừa qua?' },
}

function adviceFor(card: Card, deckId: string): CardAdvice {
  const major = majorIndexFor(card, deckId)
  if (major !== null) return majorAdvice[major]

  if (['soimoi', 'rider-waite', 'marseille', 'vieville', 'visconti-sforza'].includes(deckId)) {
    const minor = card.id.match(/^(Wands|Cups|Swords|Pents)(\d{2})$/)
    if (minor) {
      const note = minorNotes[minor[1]]?.[Number(minor[2])]
      if (note) return {
        focus: note[0].split(' · ')[0].toLowerCase(),
        notice: `${note[1]} Điều này có xuất hiện trong chuyện bạn đang nghĩ tới không?`,
        action: note[2],
        question: 'Sau khi nhìn lại lá bài, bạn muốn thay đổi điều gì trong cách mình bước tiếp?',
      }
    }
  }

  return {
    focus: 'hình ảnh và cảm nhận đầu tiên',
    notice: `Nhìn lại lá ${card.name}: chi tiết nào khiến bạn dừng mắt lâu nhất? Cảm giác đầu tiên của bạn là gì?`,
    action: 'Ghi cảm giác đó thành một câu, rồi chọn một việc nhỏ liên quan tới điều bạn đang băn khoăn để làm trong hôm nay.',
    question: 'Nếu hình ảnh này là một lời nhắc riêng cho bạn, nó đang nhắc điều gì?',
  }
}

export function readingAdvice(cards: Card[], deckId: string): ReadingAdvice {
  if (!cards.length) return { summary: '', steps: [] }
  const imageryDeck = ['sola-busca', 'etteilla', 'tarot-nouveau'].includes(deckId)
  if (cards.length === 1) {
    const advice = adviceFor(cards[0], deckId)
    const title = meaningFor(cards[0], deckId).title
    return {
      summary: `Với ${title}, hãy chú ý tới ${advice.focus}. ${advice.action}`,
      steps: [
        { label: 'Nhìn rõ', text: advice.notice },
        { label: 'Thử ngay', text: advice.action },
        { label: 'Mang theo', text: advice.question },
      ],
    }
  }

  const [first, middle, last] = cards.map((card) => adviceFor(card, deckId))
  const names = cards.map((card) => meaningFor(card, deckId).title)
  return {
    summary: imageryDeck
      ? 'Ghi một từ cho mỗi lá: điều đã dẫn bạn tới đây, điều đang cần nhìn rõ, và hướng muốn bước tiếp. Nối ba từ ấy thành một câu, rồi chọn một việc nhỏ để làm hôm nay.'
      : `Từ ${first.focus}, qua ${middle.focus}, trải bài hướng bạn tới ${last.focus}. ${last.action}`,
    steps: [
      { label: `01 · ${names[0]}`, text: first.notice },
      { label: `02 · ${names[1]}`, text: middle.question },
      { label: `03 · ${names[2]}`, text: last.action },
    ],
  }
}
