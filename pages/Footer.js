import Image from 'next/image'
import Link from 'next/link'

export default function Footer() {
  function onClickLink(url) {
    window.location.href = url
  }
  return (
    <div className="flex footer">
      <style jsx>{`
        .footer {
          background: #0b062d;
          border-top: 1px solid #393556;
          padding: 88px;
        }
        .f-l-desc {
          font-size: 24px;
          color: #ffffff;
          margin-top: 32px;
        }
        .f-r-list {
          width: 120px;
        }
        .f-r-title {
          color: #ffffff;
        }
        .f-r-desc {
          color: #ceccd6;
          margin-top: 20px;
          cursor: pointer;
        }

        @media (max-width: 960px) {
          .footer {
            padding: 30px 15px;
          }
          .f-left {
            display: none;
          }
          .f-r-list {
            width: 120px;
          }
          .f-r-title {
            font-size: 14px;
          }
          .f-r-desc {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="flex-1 f-left">
        <Image width={190} height={40} alt="" src="/images/logo.png" />
        <div className="f-l-desc">Let's protect chinchillas together</div>
      </div>
      <div className="f-right flex">
        <div className="f-r-list">
          {/* <div className='f-r-title'>有用的链接</div> */}
          {/* <div className='f-r-desc'>关于</div> */}
        </div>
        <div className="f-r-list">
          {/* <div className='f-r-title'>Link</div> */}
          {/* <div className='f-r-desc'>常问问题</div> */}
          {/* <div className='f-r-desc'>White paper</div> */}
          <div
            className="f-r-desc"
            onClick={() => onClickLink('https://twitter.com/chinchin_fi')}
          >
            Twitter
          </div>
          <div
            className="f-r-desc"
            onClick={() =>
              onClickLink(
                'https://chinchilla.gitbook.io/chinchilla-finance-docs/overview/what-is-chinchilla-finance'
              )
            }
          >
            White paper
          </div>
          <div
            className="f-r-desc"
            onClick={() => onClickLink('https://discord.com/invite/mpUBe7gXAy')}
          >
            Discord
          </div>
        </div>
      </div>
    </div>
  )
}
